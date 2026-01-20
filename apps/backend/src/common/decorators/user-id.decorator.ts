import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const UserId = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.session?.userId as string;
});
