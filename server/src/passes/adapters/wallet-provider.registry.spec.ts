import { FakeWalletProvider } from '../../../test/fakes/fake-wallet.provider';
import { UnsupportedWalletPlatformError } from '../../common/errors/domain.errors';
import { WalletPlatform } from '../entities/wallet-platform.enum';
import { WalletProviderRegistry } from './wallet-provider.registry';

describe('WalletProviderRegistry', () => {
  it('resolves a provider by platform', () => {
    const google = new FakeWalletProvider(WalletPlatform.GOOGLE);
    const registry = new WalletProviderRegistry([google]);

    expect(registry.get(WalletPlatform.GOOGLE)).toBe(google);
    expect(registry.platforms).toEqual([WalletPlatform.GOOGLE]);
  });

  it('throws for an unregistered platform', () => {
    const registry = new WalletProviderRegistry([]);
    expect(() => registry.get(WalletPlatform.GOOGLE)).toThrow(
      UnsupportedWalletPlatformError,
    );
  });

  it('refuses duplicate registrations', () => {
    expect(
      () =>
        new WalletProviderRegistry([
          new FakeWalletProvider(),
          new FakeWalletProvider(),
        ]),
    ).toThrow(/Duplicate/);
  });
});
