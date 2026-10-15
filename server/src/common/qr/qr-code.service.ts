import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  /** Renders `content` as a PNG QR code and returns it as a data URL. */
  toDataUrl(content: string): Promise<string> {
    return QRCode.toDataURL(content, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
    });
  }
}
