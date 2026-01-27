import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { DodoChatRequestSchema, DodoChatResponseSchema } from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerChatApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const dodoChatRequest = registry.register('DodoChatRequest', DodoChatRequestSchema);
  const dodoChatResponse = registry.register('DodoChatResponse', DodoChatResponseSchema);
  const { errorResponse } = common;

  registry.registerPath({
    method: 'post',
    path: '/chat',
    request: {
      body: {
        content: {
          'application/json': {
            schema: dodoChatRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '두두 대화를 생성하고, 이를 반환',
        content: {
          'application/json': {
            schema: dodoChatResponse,
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
      503: {
        description: 'Service unavailable',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
    },
  });
}
