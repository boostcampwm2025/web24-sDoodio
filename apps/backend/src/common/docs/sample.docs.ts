import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { CreateSampleResponseSchema, CreateSampleSchema } from '@web24/shared';

export function registerSampleApi(registry: OpenAPIRegistry) {
  const createSampleRequest = registry.register('CreateSampleRequest', CreateSampleSchema);
  const createSampleResponse = registry.register(
    'CreateSampleResponse',
    CreateSampleResponseSchema,
  );

  registry.registerPath({
    method: 'post',
    path: '/samples',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createSampleRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Sample created',
        content: {
          'application/json': {
            schema: createSampleResponse,
          },
        },
      },
    },
  });
}
