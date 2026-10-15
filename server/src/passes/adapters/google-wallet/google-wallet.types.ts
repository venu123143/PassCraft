/**
 * Minimal typings for the parts of the Google Wallet REST API we use.
 * Reference: https://developers.google.com/wallet/reference/rest/v1
 */

export interface LocalizedString {
  defaultValue: { language: string; value: string };
}

export interface TextModuleData {
  id: string;
  header: string;
  body: string;
}

export interface GenericClass {
  id: string;
  classTemplateInfo?: {
    cardTemplateOverride?: {
      cardRowTemplateInfos: Array<{
        oneItem: {
          item: { firstValue: { fields: Array<{ fieldPath: string }> } };
        };
      }>;
    };
  };
}

export interface GenericObject {
  id: string;
  classId: string;
  state: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'INACTIVE';
  cardTitle: LocalizedString;
  header: LocalizedString;
  textModulesData: TextModuleData[];
  barcode: { type: 'QR_CODE'; value: string; alternateText?: string };
  hexBackgroundColor?: string;
  logo?: {
    sourceUri: { uri: string };
    contentDescription: LocalizedString;
  };
}

export type GenericObjectPatch = Pick<GenericObject, 'textModulesData'>;

/** Claims of the signed "Save to Google Wallet" JWT. */
export interface SaveToWalletClaims {
  iss: string;
  aud: 'google';
  typ: 'savetowallet';
  origins: string[];
  payload: { genericObjects: Array<Pick<GenericObject, 'id' | 'classId'>> };
}
