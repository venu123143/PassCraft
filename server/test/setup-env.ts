// Env for e2e tests. Must run before AppModule is imported, because
// ConfigModule.forRoot() validates process.env at import time.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: 'file:./data/e2e-unused.db',
  GOOGLE_ISSUER_ID: '3388000000012345678',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'issuer@demo.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\\nnot-a-real-key\\n-----END PRIVATE KEY-----',
});
