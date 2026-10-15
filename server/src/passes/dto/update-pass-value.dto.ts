import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
import { PASS_VALUE_MAX, PASS_VALUE_MIN } from '../entities/pass.entity';

export class UpdatePassValueDto {
  @ApiProperty({
    description: 'New number to show on the pass',
    example: 55,
    minimum: PASS_VALUE_MIN,
    maximum: PASS_VALUE_MAX,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(PASS_VALUE_MIN)
  @Max(PASS_VALUE_MAX)
  value: number;
}
