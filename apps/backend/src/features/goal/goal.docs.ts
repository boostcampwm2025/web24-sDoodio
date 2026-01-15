import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetGoalsResponseSchema,
  GetGoalResponseSchema,
  CreateGoalRequestSchema,
  CreateGoalResponseSchema,
  GoalTemplateListResponseSchema,
  GetGoalBehaviorsResponseSchema,
  GetGoalStampsResponseSchema,
} from '@web24/shared';

export function registerGoalApi(registry: OpenAPIRegistry) {
  const getGoalsResponse = registry.register('GetGoalsResponse', GetGoalsResponseSchema);
  const createGoalRequest = registry.register('CreateGoalRequest', CreateGoalRequestSchema);
  const createGoalResponse = registry.register('CreateGoalResponse', CreateGoalResponseSchema);
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
    method: 'get',
    path: '/goals/templates',
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
