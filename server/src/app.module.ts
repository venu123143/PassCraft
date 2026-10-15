import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { googleWalletConfig } from './config/google-wallet.config';
import { HealthController } from './health.controller';
import { PassesModule } from './passes/passes.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, googleWalletConfig],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false, allowUnknown: true },
    }),
    PrismaModule,
    PassesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
