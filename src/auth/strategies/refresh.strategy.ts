import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../auth.service';

/**
 * Hàm extract refresh token từ cookie
 */
const extractRefreshTokenFromCookie = (req: Request): string | null => {
    if (req && req.cookies) {
        return req.cookies['refreshToken'] || null;
    }
    return null;
};

/**
 * Strategy xử lý Refresh Token
 * Đọc refresh token từ HttpOnly cookie
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        super({
            // Lấy token từ cookie (ưu tiên) hoặc header
            jwtFromRequest: ExtractJwt.fromExtractors([
                extractRefreshTokenFromCookie,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            // Dùng chung secret với access token (hoặc có thể tách riêng)
            secretOrKey: configService.get<string>('auth.jwtSecret'),
            // Cho phép truy cập request để lấy raw token
            passReqToCallback: true,
        });
    }

    /**
     * Validate refresh token payload
     */
    async validate(req: Request, payload: JwtPayload) {
        // Lấy refresh token từ cookie hoặc header
        const refreshToken = req.cookies?.refreshToken ||
            req.get('Authorization')?.replace('Bearer ', '').trim();

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token không được cung cấp');
        }

        if (!payload._id) {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }

        // Trả về payload kèm refresh token để service verify
        return {
            _id: payload._id,
            email: payload.email,
            full_name: payload.full_name,
            role: payload.role,
            refreshToken,
        };
    }
}