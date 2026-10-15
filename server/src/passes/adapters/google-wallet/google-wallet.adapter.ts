import { Injectable, Logger } from '@nestjs/common';
import { Pass } from '../../entities/pass.entity';
import { WalletPlatform } from '../../entities/wallet-platform.enum';
import {
  IssuedWalletPass,
  WalletProvider,
} from '../../interfaces/wallet-provider.interface';
import { GoogleWalletClient } from './google-wallet.client';
import { GoogleWalletMapper } from './google-wallet.mapper';
import { GoogleWalletSaveLinkFactory } from './google-wallet.save-link';

/** WalletProvider implementation backed by the Google Wallet API (Generic passes). */
@Injectable()
export class GoogleWalletAdapter extends WalletProvider {
  readonly platform = WalletPlatform.GOOGLE;

  private readonly logger = new Logger(GoogleWalletAdapter.name);
  /** Shared in-flight/complete check so the class is ensured once per process. */
  private classReady: Promise<void> | null = null;

  constructor(
    private readonly client: GoogleWalletClient,
    private readonly mapper: GoogleWalletMapper,
    private readonly saveLinks: GoogleWalletSaveLinkFactory,
  ) {
    super();
  }

  async createPassClassAndObject(pass: Pass): Promise<IssuedWalletPass> {
    await this.ensureClass();

    const genericObject = this.mapper.toGenericObject(pass);
    await this.client.insertObject(genericObject);
    this.logger.log(`Created Google Wallet object ${genericObject.id}`);

    return {
      saveUrl: this.saveLinks.create(genericObject.id, genericObject.classId),
    };
  }

  async updatePassObject(pass: Pass): Promise<void> {
    const objectId = this.mapper.objectId(pass);
    await this.client.patchObject(objectId, this.mapper.toValuePatch(pass));
    this.logger.log(
      `Pushed value ${pass.value} to Google Wallet object ${objectId}`,
    );
  }

  private ensureClass(): Promise<void> {
    this.classReady ??= this.createClassIfMissing().catch((error: unknown) => {
      this.classReady = null; // allow a retry on the next request
      throw error;
    });
    return this.classReady;
  }

  private async createClassIfMissing(): Promise<void> {
    const classId = this.mapper.classId;
    if (await this.client.getClass(classId)) return;

    await this.client.insertClass(this.mapper.toGenericClass());
    this.logger.log(`Created Google Wallet class ${classId}`);
  }
}
