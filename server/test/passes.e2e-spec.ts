import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PassRepository } from '../src/passes/interfaces/pass-repository.interface';
import { WALLET_PROVIDERS } from '../src/passes/interfaces/wallet-provider.interface';
import { PrismaService } from '../src/prisma/prisma.service';
import { FakeWalletProvider } from './fakes/fake-wallet.provider';
import { InMemoryPassRepository } from './fakes/in-memory-pass.repository';

interface PassBody {
  id: string;
  uniquePassId: string;
  name: string;
  label: string;
  value: number;
  platform: string;
  saveUrl: string;
  qrCodeDataUrl?: string;
}

describe('Passes API (e2e)', () => {
  let app: INestApplication<App>;
  let wallet: FakeWalletProvider;

  beforeAll(async () => {
    wallet = new FakeWalletProvider();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(PassRepository)
      .useValue(new InMemoryPassRepository())
      .overrideProvider(WALLET_PROVIDERS)
      .useValue([wallet])
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const createPass = async (): Promise<PassBody> => {
    const res = await request(app.getHttpServer())
      .post('/passes')
      .send({ name: 'Venu', label: 'Balance', value: 40 })
      .expect(201);
    return res.body as PassBody;
  };

  it('GET /health', () =>
    request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' }));

  describe('POST /passes', () => {
    it('creates a pass and returns the save link + QR', async () => {
      const body = await createPass();

      expect(body).toMatchObject({
        name: 'Venu',
        label: 'Balance',
        value: 40,
        platform: 'google',
      });
      expect(body.saveUrl).toBe(
        `https://wallet.example/save/${body.uniquePassId}`,
      );
      expect(body.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it.each([
      ['missing name', { label: 'Balance', value: 1 }],
      ['blank name', { name: '   ', label: 'Balance', value: 1 }],
      ['string value', { name: 'A', label: 'B', value: '40' }],
      ['negative value', { name: 'A', label: 'B', value: -1 }],
      ['too many decimals', { name: 'A', label: 'B', value: 1.234 }],
      ['unknown platform', { name: 'A', label: 'B', value: 1, platform: 'x' }],
      ['unexpected field', { name: 'A', label: 'B', value: 1, admin: true }],
    ])('rejects %s with 400', (_case, payload) =>
      request(app.getHttpServer()).post('/passes').send(payload).expect(400),
    );

    it('returns 502 when the wallet platform fails', async () => {
      wallet.failNextCall = true;
      const res = await request(app.getHttpServer())
        .post('/passes')
        .send({ name: 'Venu', label: 'Balance', value: 40 })
        .expect(502);
      expect(res.body).toMatchObject({ error: 'WalletProviderError' });
    });
  });

  describe('POST|PATCH /passes/:id', () => {
    it('updates the value and pushes it to the wallet', async () => {
      const created = await createPass();

      const res = await request(app.getHttpServer())
        .post(`/passes/${created.id}`)
        .send({ value: 55 })
        .expect(200);

      expect((res.body as PassBody).value).toBe(55);
      expect(wallet.updates).toContainEqual({
        uniquePassId: created.uniquePassId,
        value: 55,
      });

      await request(app.getHttpServer())
        .patch(`/passes/${created.id}`)
        .send({ value: 60 })
        .expect(200);
      const fetched = await request(app.getHttpServer())
        .get(`/passes/${created.id}`)
        .expect(200);
      expect((fetched.body as PassBody).value).toBe(60);
    });

    it('returns 404 for an unknown pass', () =>
      request(app.getHttpServer())
        .post('/passes/3f0c6f4e-5b8a-4d55-9a57-2f1f0f7b9c11')
        .send({ value: 55 })
        .expect(404));

    it('returns 400 for a malformed id', () =>
      request(app.getHttpServer())
        .post('/passes/not-a-uuid')
        .send({ value: 55 })
        .expect(400));

    it('returns 400 for a missing value', async () => {
      const created = await createPass();
      await request(app.getHttpServer())
        .post(`/passes/${created.id}`)
        .send({})
        .expect(400);
    });
  });
});
