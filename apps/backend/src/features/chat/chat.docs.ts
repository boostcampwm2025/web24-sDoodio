import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  DodoChatRequestSchema,
  DodoChatResponseSchema,
  DodoChatHistoryRequestSchema,
  DodoChatHistoryResponseSchema,
} from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerChatApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const dodoChatRequest = registry.register('DodoChatRequest', DodoChatRequestSchema);
  const dodoChatResponse = registry.register('DodoChatResponse', DodoChatResponseSchema);
  const dodoChatHistoryRequest = registry.register(
    'DodoChatHistoryRequest',
    DodoChatHistoryRequestSchema,
  );
  const dodoChatHistoryResponse = registry.register(
    'DodoChatHistoryResponse',
    DodoChatHistoryResponseSchema,
  );
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
      429: {
        description: '채팅 제한에 걸린 경우 (두두 메시지 반환)',
        content: {
          'application/json': {
            schema: dodoChatResponse,
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

  registry.registerPath({
    method: 'get',
    path: '/chat/history',
    request: {
      query: dodoChatHistoryRequest,
    },
    responses: {
      200: {
        description: '두두 채팅 히스토리를 조회',
        content: {
          'application/json': {
            schema: dodoChatHistoryResponse,
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
