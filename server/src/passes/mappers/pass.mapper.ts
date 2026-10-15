import { Pass as PassRecord } from '@prisma/client';
import { Pass } from '../entities/pass.entity';
import { WalletPlatform } from '../entities/wallet-platform.enum';
import { PassResponseDto } from '../dto/pass-response.dto';

/** Translates between the Pass entity, its DB record and its API shape. */
export class PassMapper {
  static toDomain(record: PassRecord): Pass {
    return Pass.restore({
      id: record.id,
      uniquePassId: record.uniquePassId,
      name: record.name,
      label: record.label,
      value: record.value,
      platform: record.platform as WalletPlatform,
      saveUrl: record.saveUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(pass: Pass): PassRecord {
    return { ...pass.toSnapshot() };
  }

  static toResponse(pass: Pass): PassResponseDto {
    const snapshot = pass.toSnapshot();
    return {
      id: snapshot.id,
      uniquePassId: snapshot.uniquePassId,
      name: snapshot.name,
      label: snapshot.label,
      value: snapshot.value,
      platform: snapshot.platform,
      saveUrl: snapshot.saveUrl,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }
}
