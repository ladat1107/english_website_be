import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>('auth.googleClientId'),
            clientSecret: configService.get<string>('auth.googleClientSecret'),
            callbackURL: configService.get<string>('auth.googleCallbackURL'),
            scope: ['email', 'profile'],
            // Cho phép truyền state để lưu thông tin redirect URL
            passReqToCallback: true,
        });
    }


    /**
   * Hàm authenticate override để thêm state parameter
   */
    authenticate(req: any, options?: any) {
        // Lấy redirect URL từ query parameter của request ban đầu
        const redirect = req.query.redirect || '/';

        // Mã hóa redirect URL vào state dưới dạng base64
        const stateData = {
            redirect,
        };
        const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

        // Gọi hàm authenticate gốc với state đã thêm 
        super.authenticate(req, {
            ...options,
            state,
        });
    }

    /**
   * Callback sau khi Google xác thực thành công
   * Trích xuất thông tin user từ profile Google
   */
    async validate(
        req: any,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {
        
        const { id, emails, displayName, photos } = profile;

        // Tạo object user từ thông tin Google
        const user = {
            googleId: id,
            email: emails?.[0]?.value,
            name: displayName,
            avatar: photos?.[0]?.value,
        };

        // Trả về user object để controller xử lý tiếp
        done(null, user);
    }
}
