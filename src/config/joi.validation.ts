import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
    // Global server configuration
    NODE_ENV: Joi.string()
        .valid('development', 'production')
        .default('development'),
    PORT: Joi.number().default(3000),
    FRONTEND_URL: Joi.string().uri().default('http://localhost:4200'),

    // Database configuration (prisma)
    DATABASE_URL: Joi.string().required(),
    
    // JWT configuration
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().regex(/^\d+(s|m|h|d)$/),

    // Discord login configuration
    ENABLE_DISCORD_LOGIN: Joi.boolean().default(false),

    DISCORD_CLIENT_ID: Joi.string().when('ENABLE_DISCORD_LOGIN', {
        is: Joi.boolean().valid(true),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    DISCORD_CLIENT_SECRET: Joi.string().when('ENABLE_DISCORD_LOGIN', {
        is: Joi.boolean().valid(true),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    DISCORD_CALLBACK_URL: Joi.string().when('ENABLE_DISCORD_LOGIN', {
        is: Joi.boolean().valid(true),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
});
