import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetDifficultyStatsResponseSchema,
  GetStatInsightsResponseSchema
  GetTopBehaviorsStatResponseSchema,
  GetTotalCompletedCountResponseSchema,
} from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerStatApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const getDifficultyStatsResponse = registry.register(
    'GetDifficultyStatsResponse',
    GetDifficultyStatsResponseSchema,
  );
  const getStatInsightsResponse = registry.register(
    'GetStatInsightsResponse',
    GetStatInsightsResponseSchema,
  );

  const getTopBehaviorsStatResponse = registry.register(
    'GetTopBehaviorsStatResponse',
    GetTopBehaviorsStatResponseSchema,
  );

  const getTotalCompletedCountResponse = registry.register(
    'GetTotalCompletedCountResponse',
    GetTotalCompletedCountResponseSchema,
  );

  const { errorResponse } = common;

  registry.registerPath({
    method: 'get',
    path: '/stats/difficulty',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: '주간 난이도별 수행 횟수 배열을 반환',
        content: {
          'application/json': {
            schema: getDifficultyStatsResponse,
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
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/stats/top-behaviors',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: '오늘 기준 Top behaviors 통계를 반환 (전체 + 목표별)',
        content: {
          'application/json': {
            schema: getTopBehaviorsStatResponse,
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
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/stats/total-completed-count',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: '지금까지 완료한 전체 행동 횟수를 반환',
        content: {
          'application/json': {
            schema: getTotalCompletedCountResponse,
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
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/stats/insights',
    security: [{ sessionAuth: [] }],
    responses: {
      200: {
        description: '랜덤 문구용 통계 데이터를 반환',
        content: {
          'application/json': {
            schema: getStatInsightsResponse,
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
    },
  });
}
