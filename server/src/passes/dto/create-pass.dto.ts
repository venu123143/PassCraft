import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PASS_VALUE_MAX, PASS_VALUE_MIN } from '../entities/pass.entity';
import { WalletPlatform } from '../entities/wallet-platform.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePassDto {
  @ApiProperty({
    description: 'Pass holder name shown as the card header',
    example: 'Venu Reddy',
    maxLength: 100,
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Label shown next to the number',
    example: 'Balance',
    maxLength: 50,
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  label: string;

  @ApiProperty({
    description: 'Number shown on the pass (max 2 decimal places)',
    example: 40,
    minimum: PASS_VALUE_MIN,
    maximum: PASS_VALUE_MAX,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(PASS_VALUE_MIN)
  @Max(PASS_VALUE_MAX)
  value: number;

  @ApiPropertyOptional({
    description:
      'Wallet platform to issue the pass to. Defaults to DEFAULT_WALLET_PLATFORM.',
    enum: WalletPlatform,
    example: WalletPlatform.GOOGLE,
  })
  @IsOptional()
  @IsEnum(WalletPlatform)
  platform?: WalletPlatform;
}
