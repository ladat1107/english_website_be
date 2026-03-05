import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,

    brevoApiKey: process.env.BREVO_API_KEY,
    senderName: process.env.MAIL_SENDER_NAME,
    senderEmail: process.env.MAIL_SENDER_EMAIL,

}));