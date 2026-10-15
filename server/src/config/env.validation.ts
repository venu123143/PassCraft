import * as Joi from 'joi';
import { WalletPlatform } from '../passes/entities/wallet-platform.enum';

/**
 * Validates process.env at startup. If anything required is missing or
 * malformed, the app refuses to boot with a descriptive message.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required(),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  PUBLIC_BASE_URL: Joi.string().uri().allow('').default(''),

  DEFAULT_WALLET_PLATFORM: Joi.string()
    .valid(...Object.values(WalletPlatform))
    .default(WalletPlatform.GOOGLE),

  GOOGLE_ISSUER_ID: Joi.string()
    .pattern(/^\d+$/, 'numeric issuer id')
    .required(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: Joi.string().email().required(),
  GOOGLE_PRIVATE_KEY: Joi.string()
    .pattern(/BEGIN (RSA )?PRIVATE KEY/, 'PEM private key')
    .required(),
  GOOGLE_CLASS_SUFFIX: Joi.string()
    .pattern(/^[\w.-]+$/, 'letters, digits, ".", "_" or "-"')
    .default('passcraft_generic_v1'),
  GOOGLE_CARD_TITLE: Joi.string().max(60).default('PassCraft'),
  GOOGLE_LOGO_URL: Joi.string()
    .uri({ scheme: ['https'] })
    .allow(''),
  GOOGLE_BACKGROUND_COLOR: Joi.string()
    .pattern(/^#[0-9a-fA-F]{6}$/, 'hex colour like #1a73e8')
    .default('#1a73e8'),
  WALLET_ORIGINS: Joi.string().allow('').default(''),
});
