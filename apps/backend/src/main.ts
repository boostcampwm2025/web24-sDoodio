import * as Sentry from '@sentry/nestjs';
import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionLoggingFilter } from './common/logger/http-exception.filter';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { openApiDocument } from './common/docs/openapi';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV !== 'development') {
    app.set('trust proxy', 1);
  }

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: process.env.FE_URL ?? 'http://localhost:5173',
      credentials: true,
      methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
  }

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionLoggingFilter());

  SwaggerModule.setup('docs', app, openApiDocument as OpenAPIObject);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
