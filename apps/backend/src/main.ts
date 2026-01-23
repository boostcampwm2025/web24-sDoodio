import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionLoggingFilter } from './common/logger/http-exception.filter';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { openApiDocument } from './common/docs/openapi';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

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
