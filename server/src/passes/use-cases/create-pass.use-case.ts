import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { appConfig } from '../../config/app.config';
import { QrCodeService } from '../../common/qr/qr-code.service';
import { WalletProviderRegistry } from '../adapters/wallet-provider.registry';
import { Pass } from '../entities/pass.entity';
import { WalletPlatform } from '../entities/wallet-platform.enum';
import { PassRepository } from '../interfaces/pass-repository.interface';

export interface CreatePassCommand {
  name: string;
  label: string;
  value: number;
  platform?: WalletPlatform;
}

export interface CreatePassResult {
  pass: Pass;
  saveUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Creates a pass: persists it, issues it on the wallet platform and returns
 * the "add to wallet" link (plus a QR code of that link).
 */
@Injectable()
export class CreatePassUseCase {
  private readonly logger = new Logger(CreatePassUseCase.name);

  constructor(
    private readonly passes: PassRepository,
    private readonly wallets: WalletProviderRegistry,
    private readonly qrCodes: QrCodeService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async execute(command: CreatePassCommand): Promise<CreatePassResult> {
    const pass = Pass.create({
      ...command,
      platform: command.platform ?? this.config.defaultWalletPlatform,
    });
    const wallet = this.wallets.get(pass.platform);

    await this.passes.save(pass);

    try {
      const { saveUrl } = await wallet.createPassClassAndObject(pass);
      pass.attachSaveUrl(saveUrl);
      await this.passes.save(pass);
    } catch (error) {
      // Compensate: don't leave a pass in the DB that was never issued.
      await this.passes.delete(pass.id).catch((cleanupError: unknown) => {
        this.logger.warn(
          `Could not roll back pass ${pass.id}: ${String(cleanupError)}`,
        );
      });
      throw error;
    }

    const saveUrl = pass.saveUrl as string;
    return {
      pass,
      saveUrl,
      qrCodeDataUrl: await this.qrCodes.toDataUrl(saveUrl),
    };
  }
}
