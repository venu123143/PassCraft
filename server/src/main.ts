import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, setupSwagger } from './app.setup';
import { appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.enableCors({
    origin: config.corsOrigins.length > 0 ? config.corsOrigins : true,
  });
  app.enableShutdownHooks();
  configureApp(app);
  setupSwagger(app, config.publicBaseUrl || undefined);

  await app.listen(config.port, '0.0.0.0');
  Logger.log(
    `PassCraft API listening on port ${config.port} (docs at /docs)`,
    'Bootstrap',
  );
}

void bootstrap();
