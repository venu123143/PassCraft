import { ApiProperty } from '@nestjs/swagger';
import { WalletPlatform } from '../entities/wallet-platform.enum';

export class PassResponseDto {
  @ApiProperty({
    description: 'Pass id used in API paths',
    example: '3f0c6f4e-5b8a-4d55-9a57-2f1f0f7b9c11',
  })
  id: string;

  @ApiProperty({
    description: 'Unique pass id encoded in the QR code on the pass',
    example: '9d2b1c6a-0e7f-4b3a-8c1d-5e6f7a8b9c0d',
  })
  uniquePassId: string;

  @ApiProperty({ example: 'Venu Reddy' })
  name: string;

  @ApiProperty({ example: 'Balance' })
  label: string;

  @ApiProperty({ example: 40 })
  value: number;

  @ApiProperty({ enum: WalletPlatform, example: WalletPlatform.GOOGLE })
  platform: WalletPlatform;

  @ApiProperty({
    description: '"Add to wallet" link',
    example: 'https://pay.google.com/gp/v/save/eyJhbGciOi...',
    nullable: true,
    type: String,
  })
  saveUrl: string | null;

  @ApiProperty({ example: '2026-10-15T15:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-15T15:30:00.000Z' })
  updatedAt: string;
}
