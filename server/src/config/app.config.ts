import { registerAs } from '@nestjs/config';
import { WalletPlatform } from '../passes/entities/wallet-platform.enum';
import { splitCsv } from './config.utils';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: splitCsv(process.env.CORS_ORIGINS),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? '',
  defaultWalletPlatform: (process.env.DEFAULT_WALLET_PLATFORM ??
    WalletPlatform.GOOGLE) as WalletPlatform,
}));
