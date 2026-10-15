import { Inject, Injectable } from '@nestjs/common';
import { UnsupportedWalletPlatformError } from '../../common/errors/domain.errors';
import { WalletPlatform } from '../entities/wallet-platform.enum';
import {
  WALLET_PROVIDERS,
  WalletProvider,
} from '../interfaces/wallet-provider.interface';

/**
 * Looks up the WalletProvider for a platform. Use-cases go through this
 * registry, so adding a platform never touches them.
 */
@Injectable()
export class WalletProviderRegistry {
  private readonly providers = new Map<WalletPlatform, WalletProvider>();

  constructor(@Inject(WALLET_PROVIDERS) providers: WalletProvider[]) {
    for (const provider of providers) {
      if (this.providers.has(provider.platform)) {
        throw new Error(
          `Duplicate wallet provider registered for "${provider.platform}"`,
        );
      }
      this.providers.set(provider.platform, provider);
    }
  }

  get(platform: WalletPlatform): WalletProvider {
    const provider = this.providers.get(platform);
    if (!provider) throw new UnsupportedWalletPlatformError(platform);
    return provider;
  }

  get platforms(): WalletPlatform[] {
    return [...this.providers.keys()];
  }
}
