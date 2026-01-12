import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetGoalsResponseSchema,
  CreateGoalRequestSchema,
  CreateGoalResponseSchema,
  GoalTemplateListResponseSchema,
} from '@web24/shared';

export function registerGoalApi(registry: OpenAPIRegistry) {
  const getGoalsResponse = registry.register('GetGoalsResponse', GetGoalsResponseSchema);
  const createGoalRequest = registry.register('CreateGoalRequest', CreateGoalRequestSchema);
  const createGoalResponse = registry.register('CreateGoalResponse', CreateGoalResponseSchema);
  const getGoalTemplatesResponse = registry.register(
    'GetGoalTemplatesResponse',
    GoalTemplateListResponseSchema,
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
}
