import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionLoggingFilter } from './common/logger/http-exception.filter';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { openApiDocument } from './common/docs/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionLoggingFilter());

  SwaggerModule.setup('docs', app, openApiDocument as unknown as OpenAPIObject);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
