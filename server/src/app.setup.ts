import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';

/**
 * Global HTTP setup shared by main.ts and the e2e tests, so tests exercise
 * exactly the same validation and error handling as production.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
}

export function setupSwagger(app: INestApplication, serverUrl?: string): void {
  const builder = new DocumentBuilder()
    .setTitle('PassCraft API')
    .setDescription(
      'Issue digital passes to Google Wallet and update them live on the phone.',
    )
    .setVersion('1.0.0')
    .addTag('passes', 'Create passes and push live value updates')
    .addTag('health', 'Liveness check');
  if (serverUrl) builder.addServer(serverUrl);

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    customSiteTitle: 'PassCraft API docs',
  });
}
