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
}
