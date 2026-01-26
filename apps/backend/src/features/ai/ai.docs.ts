import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { DodoChatRequestSchema, DodoChatResponseSchema } from '@web24/shared';

export function registerAIApi(registry: OpenAPIRegistry) {
  const dodoChatRequest = registry.register('DodoChatRequest', DodoChatRequestSchema);
  const dodoChatResponse = registry.register('DodoChatResponse', DodoChatResponseSchema);

  registry.registerPath({
    method: 'post',
    path: '/ai/chat',
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
      200: {
        description: '두두 대화를 생성하고, 이를 반환',
        content: {
          'application/json': {
            schema: dodoChatResponse,
          },
        },
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'Internal server error',
      },
    },
  });
}
