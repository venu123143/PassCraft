import { FakeWalletProvider } from '../../../test/fakes/fake-wallet.provider';
import { InMemoryPassRepository } from '../../../test/fakes/in-memory-pass.repository';
import {
  UnsupportedWalletPlatformError,
  WalletProviderError,
} from '../../common/errors/domain.errors';
import { QrCodeService } from '../../common/qr/qr-code.service';
import { WalletProviderRegistry } from '../adapters/wallet-provider.registry';
import { WalletPlatform } from '../entities/wallet-platform.enum';
import { CreatePassUseCase } from './create-pass.use-case';

describe('CreatePassUseCase', () => {
  let repository: InMemoryPassRepository;
  let wallet: FakeWalletProvider;
  let useCase: CreatePassUseCase;

  beforeEach(() => {
    repository = new InMemoryPassRepository();
    wallet = new FakeWalletProvider();
    useCase = new CreatePassUseCase(
      repository,
      new WalletProviderRegistry([wallet]),
      new QrCodeService(),
      {
        nodeEnv: 'test',
        port: 3000,
        corsOrigins: [],
        publicBaseUrl: '',
        defaultWalletPlatform: WalletPlatform.GOOGLE,
      },
    );
  });

  it('persists the pass, issues it and returns the save link + QR', async () => {
    const result = await useCase.execute({
      name: 'Venu',
      label: 'Balance',
      value: 40,
    });

    expect(result.saveUrl).toBe(
      `https://wallet.example/save/${result.pass.uniquePassId}`,
    );
    expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.pass.platform).toBe(WalletPlatform.GOOGLE);
    expect(wallet.created).toEqual([result.pass.uniquePassId]);

    const stored = await repository.findById(result.pass.id);
    expect(stored?.saveUrl).toBe(result.saveUrl);
  });

  it('rolls back the stored pass when the wallet provider fails', async () => {
    wallet.failNextCall = true;

    await expect(
      useCase.execute({ name: 'Venu', label: 'Balance', value: 40 }),
    ).rejects.toBeInstanceOf(WalletProviderError);
    expect(repository.size).toBe(0);
  });

  it('rejects a platform with no registered provider before saving', async () => {
    const empty = new CreatePassUseCase(
      repository,
      new WalletProviderRegistry([]),
      new QrCodeService(),
      {
        nodeEnv: 'test',
        port: 3000,
        corsOrigins: [],
        publicBaseUrl: '',
        defaultWalletPlatform: WalletPlatform.GOOGLE,
      },
    );

    await expect(
      empty.execute({ name: 'Venu', label: 'Balance', value: 40 }),
    ).rejects.toBeInstanceOf(UnsupportedWalletPlatformError);
    expect(repository.size).toBe(0);
  });
});
