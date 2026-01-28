import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/user.service';
import { UserRole } from 'src/utils/constants/enum';
import { compareData, hashData } from 'src/utils/functions/hash';
import { UserDocument } from '@/user/schemas/user.schemas';

/**
 * Interface định nghĩa payload của JWT
 */
export interface JwtPayload {
  _id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

/**
 * Interface định nghĩa cặp token trả về
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Service xử lý logic Authentication
 * Bao gồm: Google OAuth, JWT tokens, Refresh tokens
 */
@Injectable()
export class AuthService {
  private access_exp: string | undefined;
  private refresh_exp: string | undefined;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    this.access_exp = this.configService.get<string>('auth.accessTokenExp');
    this.refresh_exp = this.configService.get<string>('auth.refreshTokenExp');
  }

  /**
   * Xử lý đăng nhập qua Google OAuth
   * Tìm hoặc tạo user, sau đó tạo tokens
   */
  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<{ user: UserDocument; authen: TokenPair }> {
    // Tìm hoặc tạo user từ thông tin Google
    const user = await this.usersService.findOrCreateByGoogle(googleUser);

    // Tạo cặp token
    const authen: TokenPair = await this.generateToken({
      _id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role as UserRole,
    });

    // Lưu refresh token (đã hash) vào database
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      await hashData(authen.refreshToken)
    );

    return { user, authen };
  }

  /**
   * Tạo cặp Access Token và Refresh Token
   */
  async generateToken(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      // Access Token - thời gian sống ngắn (1h)
      this.jwtService.signAsync({ ...payload } as any, {
        expiresIn: this.access_exp,
      } as any),
      // Refresh Token - thời gian sống dài (7d)
      this.jwtService.signAsync({ ...payload } as any, {
        expiresIn: this.refresh_exp,
      } as any),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Lấy thông tin user theo ID
   */
  async getUserById(userId: string): Promise<UserDocument | null> {
    return this.usersService.findById(userId);
  }

  /**
   * Làm mới Access Token bằng Refresh Token
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<TokenPair> {
    // Lấy user và kiểm tra refresh token
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Vui lòng đăng nhập lại');
    }

    // Verify refresh token khớp với DB
    const isValid = await compareData(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new ForbiddenException('Vui lòng đăng nhập lại');
    }

    // Tạo cặp token mới
    const authen = await this.generateToken({
      _id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role as UserRole,
    });

    // Cập nhật refresh token mới vào DB
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      await hashData(authen.refreshToken)
    );

    return authen;
  }

  /**
   * Đăng xuất - Xóa refresh token khỏi DB
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
