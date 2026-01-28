
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
    PORT: Joi.number().default(8080),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

    JWT_SECRET: Joi.string().required(),
    EXP_IN_ACCESS_TOKEN: Joi.string().required(),
    EXP_IN_REFRESH_TOKEN: Joi.string().required(),
    EXP_IN_ACCESS_COOKIE: Joi.number().required(),
    EXP_IN_REFRESH_COOKIE: Joi.number().required(),

    MONGODB_URI: Joi.string().required(),

    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().required(),

    FRONTEND_URL: Joi.string().required(),

    // MAIL_HOST: Joi.string().required(),
    // MAIL_USER: Joi.string().required(),
    // MAIL_PASS: Joi.string().required(),
});
