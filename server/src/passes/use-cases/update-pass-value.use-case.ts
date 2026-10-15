import { Injectable } from '@nestjs/common';
import { PassNotFoundError } from '../../common/errors/domain.errors';
import { WalletProviderRegistry } from '../adapters/wallet-provider.registry';
import { Pass } from '../entities/pass.entity';
import { PassRepository } from '../interfaces/pass-repository.interface';

export interface UpdatePassValueCommand {
  passId: string;
  value: number;
}

/**
 * Changes the number on a pass and pushes it to the wallet platform so the
 * saved pass on the phone updates without being re-added.
 */
@Injectable()
export class UpdatePassValueUseCase {
  constructor(
    private readonly passes: PassRepository,
    private readonly wallets: WalletProviderRegistry,
  ) {}

  async execute({ passId, value }: UpdatePassValueCommand): Promise<Pass> {
    const pass = await this.passes.findById(passId);
    if (!pass) throw new PassNotFoundError(passId);

    pass.updateValue(value);

    // Push first: if the wallet rejects the update, the stored value keeps
    // matching what the phone shows.
    await this.wallets.get(pass.platform).updatePassObject(pass);
    await this.passes.save(pass);

    return pass;
  }
}
