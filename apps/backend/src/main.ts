import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionLoggingFilter } from './common/logger/http-exception.filter';
import { LoggingInterceptor } from './common/logger/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionLoggingFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
