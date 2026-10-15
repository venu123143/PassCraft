import { Inject, Injectable } from '@nestjs/common';
import {
  type GoogleWalletConfig,
  googleWalletConfig,
} from '../../../config/google-wallet.config';
import { Pass } from '../../entities/pass.entity';
import {
  GenericClass,
  GenericObject,
  GenericObjectPatch,
  LocalizedString,
  TextModuleData,
} from './google-wallet.types';

const LANGUAGE = 'en-US';
/** Id of the text module holding the label + number; referenced by the class template. */
export const VALUE_MODULE_ID = 'value';

const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const localized = (value: string): LocalizedString => ({
  defaultValue: { language: LANGUAGE, value },
});

/** Pure translation from the Pass entity to Google Wallet "Generic" payloads. */
@Injectable()
export class GoogleWalletMapper {
  constructor(
    @Inject(googleWalletConfig.KEY)
    private readonly config: GoogleWalletConfig,
  ) {}

  get classId(): string {
    return `${this.config.issuerId}.${this.config.classSuffix}`;
  }

  objectId(pass: Pass): string {
    return `${this.config.issuerId}.${pass.uniquePassId}`;
  }

  /**
   * The class is the shared template. The card row override puts the
   * label + number on the front of the card instead of only in details.
   */
  toGenericClass(): GenericClass {
    return {
      id: this.classId,
      classTemplateInfo: {
        cardTemplateOverride: {
          cardRowTemplateInfos: [
            {
              oneItem: {
                item: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: `object.textModulesData['${VALUE_MODULE_ID}']`,
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    };
  }

  toGenericObject(pass: Pass): GenericObject {
    const object: GenericObject = {
      id: this.objectId(pass),
      classId: this.classId,
      state: 'ACTIVE',
      cardTitle: localized(this.config.cardTitle),
      header: localized(pass.name),
      textModulesData: [this.toValueModule(pass)],
      barcode: {
        type: 'QR_CODE',
        value: pass.uniquePassId,
        alternateText: pass.uniquePassId,
      },
      hexBackgroundColor: this.config.backgroundColor,
    };

    if (this.config.logoUrl) {
      object.logo = {
        sourceUri: { uri: this.config.logoUrl },
        contentDescription: localized(`${this.config.cardTitle} logo`),
      };
    }
    return object;
  }

  /** PATCH replaces arrays wholesale, so the full module list is sent. */
  toValuePatch(pass: Pass): GenericObjectPatch {
    return { textModulesData: [this.toValueModule(pass)] };
  }

  private toValueModule(pass: Pass): TextModuleData {
    return {
      id: VALUE_MODULE_ID,
      header: pass.label,
      body: numberFormat.format(pass.value),
    };
  }
}
