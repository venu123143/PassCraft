import { Injectable } from '@nestjs/common';
import { PassNotFoundError } from '../../common/errors/domain.errors';
import { Pass } from '../entities/pass.entity';
import { PassRepository } from '../interfaces/pass-repository.interface';

@Injectable()
export class GetPassUseCase {
  constructor(private readonly passes: PassRepository) {}

  async execute(passId: string): Promise<Pass> {
    const pass = await this.passes.findById(passId);
    if (!pass) throw new PassNotFoundError(passId);
    return pass;
  }
}
