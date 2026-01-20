import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ErrorResponseSchema } from '@web24/shared';

export function registerCommonSchemas(registry: OpenAPIRegistry) {
  const errorResponse = registry.register('ErrorResponse', ErrorResponseSchema);

  return {
    errorResponse,
  };
}
