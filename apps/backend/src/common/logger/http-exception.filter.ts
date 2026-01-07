import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      return;
    }

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    this.logger.error(
      `${req.method} ${req.url} ${status} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (!res.headersSent) {
      res.status(status).json({
        statusCode: status,
        message,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
