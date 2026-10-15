import { generateKeyPairSync } from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import { GoogleWalletConfig } from '../../../config/google-wallet.config';
import { Pass } from '../../entities/pass.entity';
import { WalletPlatform } from '../../entities/wallet-platform.enum';
import { GoogleWalletAdapter } from './google-wallet.adapter';
import { GoogleWalletClient } from './google-wallet.client';
import { GoogleWalletMapper, VALUE_MODULE_ID } from './google-wallet.mapper';
import {
  GOOGLE_SAVE_URL_BASE,
  GoogleWalletSaveLinkFactory,
} from './google-wallet.save-link';
import { SaveToWalletClaims } from './google-wallet.types';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const config: GoogleWalletConfig = {
  issuerId: '3388000000012345678',
  serviceAccountEmail: 'issuer@demo.iam.gserviceaccount.com',
  privateKey,
  classSuffix: 'passcraft_test',
  cardTitle: 'PassCraft',
  logoUrl: undefined,
  backgroundColor: '#1a73e8',
  origins: ['https://passcraft.example'],
};

const newPass = (): Pass =>
  Pass.create({
    name: 'Venu',
    label: 'Balance',
    value: 1234.5,
    platform: WalletPlatform.GOOGLE,
  });

describe('GoogleWalletMapper', () => {
  const mapper = new GoogleWalletMapper(config);

  it('builds the generic object with name, label/value and QR', () => {
    const pass = newPass();
    const object = mapper.toGenericObject(pass);

    expect(object.id).toBe(`${config.issuerId}.${pass.uniquePassId}`);
    expect(object.classId).toBe(`${config.issuerId}.passcraft_test`);
    expect(object.header.defaultValue.value).toBe('Venu');
    expect(object.textModulesData).toEqual([
      { id: VALUE_MODULE_ID, header: 'Balance', body: '1,234.5' },
    ]);
    expect(object.barcode).toMatchObject({
      type: 'QR_CODE',
      value: pass.uniquePassId,
    });
    expect(object.logo).toBeUndefined();
  });

  it('adds a logo only when configured', () => {
    const withLogo = new GoogleWalletMapper({
      ...config,
      logoUrl: 'https://cdn.example/logo.png',
    });
    expect(withLogo.toGenericObject(newPass()).logo?.sourceUri.uri).toBe(
      'https://cdn.example/logo.png',
    );
  });

  it('class template shows the value module on the card front', () => {
    const row =
      mapper.toGenericClass().classTemplateInfo?.cardTemplateOverride
        ?.cardRowTemplateInfos[0];
    expect(row?.oneItem.item.firstValue.fields[0].fieldPath).toBe(
      `object.textModulesData['${VALUE_MODULE_ID}']`,
    );
  });

  it('value patch carries the full text module list', () => {
    const pass = newPass();
    pass.updateValue(55);
    expect(mapper.toValuePatch(pass)).toEqual({
      textModulesData: [{ id: VALUE_MODULE_ID, header: 'Balance', body: '55' }],
    });
  });
});

describe('GoogleWalletSaveLinkFactory', () => {
  it('signs an RS256 savetowallet JWT referencing the object', () => {
    const url = new GoogleWalletSaveLinkFactory(config).create(
      'issuer.object',
      'issuer.class',
    );
    expect(url.startsWith(GOOGLE_SAVE_URL_BASE)).toBe(true);

    const token = url.slice(GOOGLE_SAVE_URL_BASE.length);
    const claims = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    }) as SaveToWalletClaims;

    expect(claims).toMatchObject({
      iss: config.serviceAccountEmail,
      aud: 'google',
      typ: 'savetowallet',
      origins: config.origins,
      payload: {
        genericObjects: [{ id: 'issuer.object', classId: 'issuer.class' }],
      },
    });
  });
});

describe('GoogleWalletAdapter', () => {
  const mapper = new GoogleWalletMapper(config);
  const saveLinks = new GoogleWalletSaveLinkFactory(config);
  let client: jest.Mocked<
    Pick<
      GoogleWalletClient,
      'getClass' | 'insertClass' | 'insertObject' | 'patchObject'
    >
  >;
  let adapter: GoogleWalletAdapter;

  beforeEach(() => {
    client = {
      getClass: jest.fn().mockResolvedValue(null),
      insertClass: jest.fn().mockResolvedValue(undefined),
      insertObject: jest.fn().mockResolvedValue(undefined),
      patchObject: jest.fn().mockResolvedValue(undefined),
    };
    adapter = new GoogleWalletAdapter(
      client as unknown as GoogleWalletClient,
      mapper,
      saveLinks,
    );
  });

  it('creates the class once, inserts the object and returns a save link', async () => {
    const first = await adapter.createPassClassAndObject(newPass());
    await adapter.createPassClassAndObject(newPass());

    expect(client.getClass).toHaveBeenCalledTimes(1);
    expect(client.insertClass).toHaveBeenCalledTimes(1);
    expect(client.insertObject).toHaveBeenCalledTimes(2);
    expect(first.saveUrl.startsWith(GOOGLE_SAVE_URL_BASE)).toBe(true);
  });

  it('skips class creation when the class already exists', async () => {
    client.getClass.mockResolvedValue(mapper.toGenericClass());
    await adapter.createPassClassAndObject(newPass());
    expect(client.insertClass).not.toHaveBeenCalled();
  });

  it('retries class creation after a failure', async () => {
    client.getClass.mockRejectedValueOnce(new Error('boom'));
    await expect(adapter.createPassClassAndObject(newPass())).rejects.toThrow(
      'boom',
    );
    await adapter.createPassClassAndObject(newPass());
    expect(client.getClass).toHaveBeenCalledTimes(2);
  });

  it('patches the object with the new value', async () => {
    const pass = newPass();
    pass.updateValue(55);
    await adapter.updatePassObject(pass);

    expect(client.patchObject).toHaveBeenCalledWith(
      mapper.objectId(pass),
      mapper.toValuePatch(pass),
    );
  });
});
