import { Inject, Injectable, Logger } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import {
  type GoogleWalletConfig,
  googleWalletConfig,
} from '../../../config/google-wallet.config';
import { WalletProviderError } from '../../../common/errors/domain.errors';
import { WalletPlatform } from '../../entities/wallet-platform.enum';
import {
  GenericClass,
  GenericObject,
  GenericObjectPatch,
} from './google-wallet.types';

const WALLET_API_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';
const WALLET_SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

/**
 * Thin, authenticated wrapper around the Google Wallet REST API.
 * Every failure leaves this class as a WalletProviderError.
 */
@Injectable()
export class GoogleWalletClient {
  private readonly logger = new Logger(GoogleWalletClient.name);
  private readonly auth: JWT;

  constructor(
    @Inject(googleWalletConfig.KEY)
    config: GoogleWalletConfig,
  ) {
    this.auth = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: [WALLET_SCOPE],
    });
  }

  /** Returns the class, or null if it does not exist yet. */
  async getClass(classId: string): Promise<GenericClass | null> {
    try {
      return await this.request<GenericClass>(
        'GET',
        `/genericClass/${encodeURIComponent(classId)}`,
      );
    } catch (error) {
      if (statusOf(error) === 404) return null;
      throw this.toProviderError(error, `fetch class ${classId}`);
    }
  }

  /** Inserts the class; an "already exists" conflict counts as success. */
  async insertClass(genericClass: GenericClass): Promise<void> {
    try {
      await this.request('POST', '/genericClass', genericClass);
    } catch (error) {
      if (statusOf(error) === 409) return;
      throw this.toProviderError(error, `create class ${genericClass.id}`);
    }
  }

  /** Inserts the object; an "already exists" conflict counts as success. */
  async insertObject(genericObject: GenericObject): Promise<void> {
    try {
      await this.request('POST', '/genericObject', genericObject);
    } catch (error) {
      if (statusOf(error) === 409) return;
      throw this.toProviderError(error, `create object ${genericObject.id}`);
    }
  }

  async patchObject(
    objectId: string,
    patch: GenericObjectPatch,
  ): Promise<void> {
    try {
      await this.request(
        'PATCH',
        `/genericObject/${encodeURIComponent(objectId)}`,
        patch,
      );
    } catch (error) {
      throw this.toProviderError(error, `update object ${objectId}`);
    }
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: object,
  ): Promise<T> {
    const response = await this.auth.request<T>({
      url: `${WALLET_API_BASE}${path}`,
      method,
      data: body,
    });
    return response.data;
  }

  private toProviderError(error: unknown, action: string): WalletProviderError {
    const status = statusOf(error);
    const detail = googleMessageOf(error);
    this.logger.error(
      `Google Wallet API failed to ${action} (status ${status ?? 'n/a'}): ${detail}`,
    );
    return new WalletProviderError(
      WalletPlatform.GOOGLE,
      `Failed to ${action}: ${detail}`,
      status,
    );
  }
}

interface HttpLikeError {
  status?: number;
  message?: string;
  response?: {
    status?: number;
    data?: { error?: { message?: string } };
  };
}

function statusOf(error: unknown): number | undefined {
  const err = error as HttpLikeError | undefined;
  return err?.response?.status ?? err?.status;
}

function googleMessageOf(error: unknown): string {
  const err = error as HttpLikeError | undefined;
  return err?.response?.data?.error?.message ?? err?.message ?? 'Unknown error';
}
