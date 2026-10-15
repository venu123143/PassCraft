import { registerAs } from '@nestjs/config';
import { normalizePrivateKey, splitCsv } from './config.utils';

export const googleWalletConfig = registerAs('googleWallet', () => ({
  issuerId: process.env.GOOGLE_ISSUER_ID ?? '',
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
  privateKey: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  classSuffix: process.env.GOOGLE_CLASS_SUFFIX ?? 'passcraft_generic_v1',
  cardTitle: process.env.GOOGLE_CARD_TITLE ?? 'PassCraft',
  logoUrl: process.env.GOOGLE_LOGO_URL || undefined,
  backgroundColor: process.env.GOOGLE_BACKGROUND_COLOR ?? '#1a73e8',
  origins: splitCsv(process.env.WALLET_ORIGINS),
}));

export type GoogleWalletConfig = ReturnType<typeof googleWalletConfig>;
