import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  type GoogleWalletConfig,
  googleWalletConfig,
} from '../../../config/google-wallet.config';
import { SaveToWalletClaims } from './google-wallet.types';

export const GOOGLE_SAVE_URL_BASE = 'https://pay.google.com/gp/v/save/';

/**
 * Builds the signed "Save to Google Wallet" link. The JWT only references
 * the object (already inserted via the API), which keeps the URL short and
 * means later updates via PATCH apply to the same object.
 */
@Injectable()
export class GoogleWalletSaveLinkFactory {
  constructor(
    @Inject(googleWalletConfig.KEY)
    private readonly config: GoogleWalletConfig,
  ) {}

  create(objectId: string, classId: string): string {
    const claims: SaveToWalletClaims = {
      iss: this.config.serviceAccountEmail,
      aud: 'google',
      typ: 'savetowallet',
      origins: this.config.origins,
      payload: { genericObjects: [{ id: objectId, classId }] },
    };
    const token = jwt.sign(claims, this.config.privateKey, {
      algorithm: 'RS256',
    });
    return `${GOOGLE_SAVE_URL_BASE}${token}`;
  }
}
