import { FakeWalletProvider } from '../../../test/fakes/fake-wallet.provider';
import { InMemoryPassRepository } from '../../../test/fakes/in-memory-pass.repository';
import {
  PassNotFoundError,
  WalletProviderError,
} from '../../common/errors/domain.errors';
import { WalletProviderRegistry } from '../adapters/wallet-provider.registry';
import { Pass } from '../entities/pass.entity';
import { WalletPlatform } from '../entities/wallet-platform.enum';
import { UpdatePassValueUseCase } from './update-pass-value.use-case';

describe('UpdatePassValueUseCase', () => {
  let repository: InMemoryPassRepository;
  let wallet: FakeWalletProvider;
  let useCase: UpdatePassValueUseCase;
  let pass: Pass;

  beforeEach(async () => {
    repository = new InMemoryPassRepository();
    wallet = new FakeWalletProvider();
    useCase = new UpdatePassValueUseCase(
      repository,
      new WalletProviderRegistry([wallet]),
    );
    pass = Pass.create({
      name: 'Venu',
      label: 'Balance',
      value: 40,
      platform: WalletPlatform.GOOGLE,
    });
    await repository.save(pass);
  });

  it('pushes the new value to the wallet and persists it', async () => {
    const updated = await useCase.execute({ passId: pass.id, value: 55 });

    expect(updated.value).toBe(55);
    expect(wallet.updates).toEqual([
      { uniquePassId: pass.uniquePassId, value: 55 },
    ]);
    expect((await repository.findById(pass.id))?.value).toBe(55);
  });

  it('throws PassNotFoundError for an unknown id', async () => {
    await expect(
      useCase.execute({ passId: 'missing', value: 1 }),
    ).rejects.toBeInstanceOf(PassNotFoundError);
  });

  it('does not persist the value when the wallet push fails', async () => {
    wallet.failNextCall = true;

    await expect(
      useCase.execute({ passId: pass.id, value: 55 }),
    ).rejects.toBeInstanceOf(WalletProviderError);
    expect((await repository.findById(pass.id))?.value).toBe(40);
  });
});
