import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetGoalsResponseSchema,
  GetGoalResponseSchema,
  CreateGoalRequestSchema,
  CreateGoalResponseSchema,
  GoalTemplateListResponseSchema,
  GetGoalBehaviorsResponseSchema,
  GetGoalStampsResponseSchema,
  UpdateGoalRequestSchema,
  UpdateGoalResponseSchema,
  CreateGoalBehaviorsRequestSchema,
  UpdateGoalBehaviorsRequestSchema,
  DeleteGoalBehaviorsRequestSchema,
} from '@web24/shared';

export function registerGoalApi(registry: OpenAPIRegistry) {
  const getGoalsResponse = registry.register('GetGoalsResponse', GetGoalsResponseSchema);
  const createGoalRequest = registry.register('CreateGoalRequest', CreateGoalRequestSchema);
  const createGoalResponse = registry.register('CreateGoalResponse', CreateGoalResponseSchema);
  const updateGoalRequest = registry.register('UpdateGoalRequest', UpdateGoalRequestSchema);
  const updateGoalResponse = registry.register('UpdateGoalResponse', UpdateGoalResponseSchema);
  const getGoalResponse = registry.register('GetGoalResponse', GetGoalResponseSchema);
  const getGoalTemplatesResponse = registry.register(
    'GetGoalTemplatesResponse',
    GoalTemplateListResponseSchema,
  );
  const getGoalBehaviorsResponse = registry.register(
    'GetGoalBehaviorsResponse',
    GetGoalBehaviorsResponseSchema,
  );
  const getGoalStampsResponse = registry.register(
    'GetGoalStampsResponse',
    GetGoalStampsResponseSchema,
  );
  const createGoalBehaviorsRequest = registry.register(
    'CreateGoalBehaviorsRequest',
    CreateGoalBehaviorsRequestSchema,
  );
  const updateGoalBehaviorsRequest = registry.register(
    'UpdateGoalBehaviorsRequest',
    UpdateGoalBehaviorsRequestSchema,
  );
  const deleteGoalBehaviorsRequest = registry.register(
    'DeleteGoalBehaviorsRequest',
    DeleteGoalBehaviorsRequestSchema,
  );

  registry.registerPath({
    method: 'get',
    path: '/goals',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: 'List of goals',
        content: {
          'application/json': {
            schema: getGoalsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/goals',
    security: [{ sessionAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: createGoalRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Goal created',
        content: {
          'application/json': {
            schema: createGoalResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/goals/{id}',
    request: {
      body: {
        content: {
          'application/json': {
            schema: updateGoalRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Goal updated',
        content: {
          'application/json': {
            schema: updateGoalResponse,
          },
        },
      },
      400: {
        description: 'Validation failed',
      },
      404: {
        description: 'Goal not found',
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/goals/templates',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: 'List of goal templates',
        content: {
          'application/json': {
            schema: getGoalTemplatesResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/goals/{id}',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: 'Goal detail',
        content: {
          'application/json': {
            schema: getGoalResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/goals/{id}/behaviors',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: 'List of behaviors for a goal',
        content: {
          'application/json': {
            schema: getGoalBehaviorsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/goals/{id}/stamps',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: 'List of stamps for a goal',
        content: {
          'application/json': {
            schema: getGoalStampsResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/goals/{goalId}/behaviors',
    summary: '목표에 새로운 행동 추가',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createGoalBehaviorsRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '행동 생성 성공',
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/goals/{goalId}/behaviors',
    summary: '목표의 행동 목록 수정',
    request: {
      body: {
        content: {
          'application/json': {
            schema: updateGoalBehaviorsRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '행동 수정 성공',
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/goals/{goalId}/behaviors',
    summary: '목표의 행동 목록 삭제',
    request: {
      body: {
        content: {
          'application/json': {
            schema: deleteGoalBehaviorsRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '행동 삭제 성공',
      },
    },
  });
}
