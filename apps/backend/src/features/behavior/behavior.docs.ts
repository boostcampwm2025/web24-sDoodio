import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  DeleteTodayBehaviorResponseSchema,
  GetAllBehaviorsResponseSchema,
  GetAIBehaviorResponseSchema,
  GetTodayBehaviorsResponseSchema,
  PostTodayBehaviorRequestSchema,
  PostTodayBehaviorResponseSchema,
  PatchAIBehaviorStatusRequestSchema,
  PatchAIBehaviorStatusResponseSchema,
  PostAIBehaviorResponseSchema,
  PatchTodayBehaviorStatusRequestSchema,
  PatchTodayBehaviorStatusResponseSchema,
} from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerBehaviorApi(registry: OpenAPIRegistry, common: CommonSchemas) {
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
  const postTodayBehaviorRequest = registry.register(
    'PostTodayBehaviorRequest',
    PostTodayBehaviorRequestSchema,
  );
  const postTodayBehaviorResponse = registry.register(
    'PostTodayBehaviorResponse',
    PostTodayBehaviorResponseSchema,
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

  const { errorResponse } = common;

  const deleteTodayBehaviorResponse = registry.register(
    'DeleteTodayBehaviorResponse',
    DeleteTodayBehaviorResponseSchema,
  );

  registry.registerPath({
    method: 'get',
    path: '/today-behaviors',
    security: [{ sessionAuth: [] }],
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
    method: 'post',
    path: '/today-behaviors/refresh',
    responses: {
      200: {
        description:
          '오늘 행동을 새로 추출해 반환한다. 기존 pending은 skipped 처리하고, completed는 유지한다.',
        content: {
          'application/json': {
            schema: getTodayBehaviorsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/today-behaviors',
    request: {
      body: {
        content: {
          'application/json': {
            schema: postTodayBehaviorRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '오늘 행동을 추가하고 전체 목록을 반환',
        content: {
          'application/json': {
            schema: postTodayBehaviorResponse,
          },
        },
      },
      400: {
        description: '이미 존재하거나 완료/AI 행동인 경우',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
      404: {
        description: 'User 또는 Behavior를 찾을 수 없음',
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
    path: '/today-behaviors/ai',
    security: [{ sessionAuth: [] }],
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
    security: [{ sessionAuth: [] }],
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
    security: [{ sessionAuth: [] }],
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
    security: [{ sessionAuth: [] }],
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
    method: 'delete',
    path: '/today-behaviors/{id}',
    responses: {
      200: {
        description: 'Today behavior deleted',
        content: {
          'application/json': {
            schema: deleteTodayBehaviorResponse,
          },
        },
      },
      400: {
        description: 'Completed behavior cannot be deleted',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
      404: {
        description: 'Today behavior not found',
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
    security: [{ sessionAuth: [] }],
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
