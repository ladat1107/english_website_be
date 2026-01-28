import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '@/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import type { Response } from 'express';


const getAccessTokenCookieOptions = (isProduction: boolean) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: Number(process.env.EXP_IN_ACCESS_COOKIE), // 1 giờ (khớp với EXP_IN_ACCESS_TOKEN)
  path: '/',
});

const getRefreshTokenCookieOptions = (isProduction: boolean) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: Number(process.env.EXP_IN_REFRESH_COOKIE), // 7 ngày
  path: '/',
});

/**
 * Controller xử lý Authentication
 * Bao gồm: Google OAuth, Refresh Token, Logout, Check Status
 */
@Controller('auth')
export class AuthController {
  private isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  /**
   * Khởi tạo Google OAuth flow
   * Query param 'redirect' để lưu trang cần quay về sau login
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard tự động redirect đến Google
  }

  /**
   * Google OAuth callback
   * Set tokens vào HttpOnly cookies và redirect về FE
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const googleUser = req.user as {
        googleId: string;
        email: string;
        name: string;
        avatar?: string;
      };

      // Xử lý login và tạo tokens
      const { user, authen } = await this.authService.googleLogin(googleUser);

      // Set cookies với HttpOnly (bảo mật)
      res.cookie('accessToken', authen.accessToken, getAccessTokenCookieOptions(this.isProduction));
      res.cookie('refreshToken', authen.refreshToken, getRefreshTokenCookieOptions(this.isProduction));

      // Lấy redirect path từ state
      const frontendUrl = this.configService.get<string>('auth.frontendUrl');
      let redirectPath = '/';

      const state = req.query.state as string;
      if (state) {
        try {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
          redirectPath = stateData.redirect || '/';
        } catch {
          // Giữ nguyên default nếu parse lỗi
        }
      }

      // Redirect về FE (không gửi token qua URL - bảo mật hơn)
      return res.redirect(`${frontendUrl}${redirectPath}?login=success&user=${encodeURIComponent(JSON.stringify({ user }))}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendUrl = this.configService.get<string>('auth.frontendUrl');
      return res.redirect(`${frontendUrl}?error=login_failed`);
    }
  }

  /**
   * Kiểm tra trạng thái authentication
   * FE gọi endpoint này để check user đã login chưa
   */

  @Get('status')
  async checkAuthStatus(@Req() req: any) {

    if (!req.user) {
      return { isAuthenticated: false, user: null };
    }

    try {
      const user = await this.authService.getUserById(req.user._id);

      if (!user) {
        return { isAuthenticated: false, user: null };
      }

      return {
        isAuthenticated: true,
        user
      };
    } catch (error) {
      // Token không hợp lệ hoặc hết hạn
      return { isAuthenticated: false, user: null }

    }
  }

  /**
   * Refresh token - Tạo access token mới
   */
  @Public()
  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const user = req.user as { _id: string; refreshToken: string };
      const authen = await this.authService.refreshTokens(user._id, user.refreshToken);

      // Set cookies mới
      res.cookie('accessToken', authen.accessToken, getAccessTokenCookieOptions(this.isProduction));
      res.cookie('refreshToken', authen.refreshToken, getRefreshTokenCookieOptions(this.isProduction));

      return { message: 'Token đã được làm mới' };
    } catch (error) {
      // Xóa cookies nếu refresh thất bại
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException('Phiên đăng nhập hết hạn');
    }
  }

  /**
   * Đăng xuất - Xóa cookies và refresh token trong DB
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const user = req.user as { _id: string };
      if (user?._id) {
        await this.authService.logout(user._id);
      }
    } catch (error) {
      // Ignore error khi logout
    }

    // Xóa cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Đăng xuất thành công' };
  }

  /**
   * Lấy thông tin user hiện tại (yêu cầu đăng nhập)
   */
  @Get('me')
  async getProfile(@Req() req: any) {
    const user = req.user;

    return {
      id: user._id,
      name: user.full_name,
      email: user.email,
      role: user.role,
    }

  }
}
