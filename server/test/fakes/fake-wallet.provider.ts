import { WalletProviderError } from '../../src/common/errors/domain.errors';
import { Pass } from '../../src/passes/entities/pass.entity';
import { WalletPlatform } from '../../src/passes/entities/wallet-platform.enum';
import {
  IssuedWalletPass,
  WalletProvider,
} from '../../src/passes/interfaces/wallet-provider.interface';

/** Test double that records calls and can be told to fail. */
export class FakeWalletProvider extends WalletProvider {
  readonly created: string[] = [];
  readonly updates: Array<{ uniquePassId: string; value: number }> = [];
  failNextCall = false;

  constructor(readonly platform: WalletPlatform = WalletPlatform.GOOGLE) {
    super();
  }

  createPassClassAndObject(pass: Pass): Promise<IssuedWalletPass> {
    this.maybeFail();
    this.created.push(pass.uniquePassId);
    return Promise.resolve({
      saveUrl: `https://wallet.example/save/${pass.uniquePassId}`,
    });
  }

  updatePassObject(pass: Pass): Promise<void> {
    this.maybeFail();
    this.updates.push({ uniquePassId: pass.uniquePassId, value: pass.value });
    return Promise.resolve();
  }

  private maybeFail(): void {
    if (!this.failNextCall) return;
    this.failNextCall = false;
    throw new WalletProviderError(this.platform, 'simulated failure', 500);
  }
}
