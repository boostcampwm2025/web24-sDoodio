import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  GetAllBehaviorsResponseSchema,
  GetAIBehaviorResponseSchema,
  GetTodayBehaviorsResponseSchema,
  PatchAIBehaviorStatusRequestSchema,
  PatchAIBehaviorStatusResponseSchema,
  PostAIBehaviorResponseSchema,
  PatchTodayBehaviorStatusRequestSchema,
  PatchTodayBehaviorStatusResponseSchema,
} from '@web24/shared';

export function registerBehaviorApi(registry: OpenAPIRegistry) {
  const getTodayBehaviorsResponse = registry.register(
    'GetTodayBehaviorsResponse',
    GetTodayBehaviorsResponseSchema,
  );
  const patchTodayBehaviorStatusRequest = registry.register(
    'PatchTodayBehaviorStatusRequest',
    PatchTodayBehaviorStatusRequestSchema,
  );
  const patchTodayBehaviorStatusResponse = registry.register(
    'PatchTodayBehaviorStatusResponse',
    PatchTodayBehaviorStatusResponseSchema,
  );
  const getAllBehaviorsResponse = registry.register(
    'GetAllBehaviorsResponse',
    GetAllBehaviorsResponseSchema,
  );
  const getAIBehaviorsResponse = registry.register(
    'GetAIBehaviorResponse',
    GetAIBehaviorResponseSchema,
  );
  const postAIBehaviorsResponse = registry.register(
    'PostAIBehaviorResponse',
    PostAIBehaviorResponseSchema,
  );
  const patchAIBehaviorStatusRequest = registry.register(
    'PatchAIBehaviorStatusRequest',
    PatchAIBehaviorStatusRequestSchema,
  );
  const patchAIBehaviorStatusResponse = registry.register(
    'PatchAIBehaviorStatusResponse',
    PatchAIBehaviorStatusResponseSchema,
  );
  const errorResponse = registry.register(
    'ErrorResponse',
    z.object({
      statusCode: z.number().int(),
      message: z.string(),
      path: z.string(),
      timestamp: z.string(),
    }),
  );

  registry.registerPath({
    method: 'get',
    path: '/today-behaviors',
    responses: {
      200: {
        description:
          '해당 날짜(새벽 4시 기준으로 변경)에 pending, completed 된 오늘 행동이 없으면 생성하고 반환, 있으면 기존 오늘 행동을 반환',
        content: {
          'application/json': {
            schema: getTodayBehaviorsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/today-behaviors/ai',
    responses: {
      200: {
        description: '오늘 AI 행동 목록을 반환, 없으면 빈 리스트',
        content: {
          'application/json': {
            schema: getAIBehaviorsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/today-behaviors/ai',
    responses: {
      200: {
        description:
          '오늘 AI 행동을 생성하고 반환, 추후 여러 AIBehavior 생성 가능성을 염두하여 현재는 하나의 값을 리스트에 담아서 반환',
        content: {
          'application/json': {
            schema: postAIBehaviorsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/today-behaviors/ai/{id}/status',
    request: {
      body: {
        content: {
          'application/json': {
            schema: patchAIBehaviorStatusRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'AI behavior status updated',
        content: {
          'application/json': {
            schema: patchAIBehaviorStatusResponse,
          },
        },
      },
      404: {
        description: 'AI behavior not found',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/today-behaviors/{id}/status',
    request: {
      body: {
        content: {
          'application/json': {
            schema: patchTodayBehaviorStatusRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Today behavior status updated',
        content: {
          'application/json': {
            schema: patchTodayBehaviorStatusResponse,
          },
        },
      },
      404: {
        description:
          'Today behavior not found (service에서 대상 today behavior가 없어 상태 변경에 실패한 경우)',
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
    path: '/behaviors/all',
    responses: {
      200: {
        description: 'List of all behaviors',
        content: {
          'application/json': {
            schema: getAllBehaviorsResponse,
          },
        },
      },
    },
  });
}
