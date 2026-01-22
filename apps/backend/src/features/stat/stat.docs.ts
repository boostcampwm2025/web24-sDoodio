import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { GetDifficultyStatsResponseSchema } from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerStatApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const getDifficultyStatsResponse = registry.register(
    'GetDifficultyStatsResponse',
    GetDifficultyStatsResponseSchema,
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
}
