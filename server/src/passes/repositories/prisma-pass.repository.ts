import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Pass } from '../entities/pass.entity';
import { PassRepository } from '../interfaces/pass-repository.interface';
import { PassMapper } from '../mappers/pass.mapper';

@Injectable()
export class PrismaPassRepository implements PassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(pass: Pass): Promise<void> {
    const data = PassMapper.toPersistence(pass);
    await this.prisma.pass.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Pass | null> {
    const record = await this.prisma.pass.findUnique({ where: { id } });
    return record ? PassMapper.toDomain(record) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pass.deleteMany({ where: { id } });
  }
}
