import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PassResponseDto } from './pass-response.dto';

export class CreatePassResponseDto extends OmitType(PassResponseDto, [
  'saveUrl',
] as const) {
  @ApiProperty({
    description: '"Add to wallet" link for the new pass',
    example: 'https://pay.google.com/gp/v/save/eyJhbGciOi...',
  })
  saveUrl: string;

  @ApiProperty({
    description:
      'PNG data URL of a QR code that opens saveUrl; scan it with a phone to add the pass from a desktop browser',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  qrCodeDataUrl: string;
}
