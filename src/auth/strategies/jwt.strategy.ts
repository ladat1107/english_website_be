import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Hàm extract JWT từ cookie
 */
export const extractJwtFromCookie = (req: Request): string | null => {
    if (req && req.cookies) {
        return req.cookies['accessToken'] || null;
    }
    return null;
};

/**
 * JWT Strategy - Đọc token từ Cookie (ưu tiên) hoặc Header
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                extractJwtFromCookie,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false, // Không bỏ qua kiểm tra token hết hạn
            secretOrKey: config.get('auth.jwtSecret'),
        });
    }

    async validate(payload: any) {
        // Payload là thông tin giải mã từ JWT
        if (!payload || !payload._id) {
            throw new UnauthorizedException("Token không hợp lệ");
        }
        return {
            _id: payload._id,
            email: payload.email,
            full_name: payload.full_name,
            role: payload.role,
        };
    }
}
