import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { CreateSampleResponseSchema, CreateSampleSchema } from '@web24/shared';

const registry = new OpenAPIRegistry();

const createSampleRequest = registry.register('CreateSampleRequest', CreateSampleSchema);
const createSampleResponse = registry.register('CreateSampleResponse', CreateSampleResponseSchema);

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

type OpenApiDocument = ReturnType<OpenApiGeneratorV3['generateDocument']>;

export const openApiDocument: OpenApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Web24 API',
    version: '0.0.0',
  },
});
