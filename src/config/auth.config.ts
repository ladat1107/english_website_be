import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET,
    accessTokenExp: process.env.EXP_IN_ACCESS_TOKEN,
    refreshTokenExp: process.env.EXP_IN_REFRESH_TOKEN,
    accessTokenCookieExp: process.env.EXP_IN_ACCESS_COOKIE,
    refreshTokenCookieExp: process.env.EXP_IN_REFRESH_COOKIE,


    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,


    frontendUrl: process.env.FRONTEND_URL,
}));        
