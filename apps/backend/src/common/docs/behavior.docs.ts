import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { GetTodayBehaviorsResponseSchema } from '@web24/shared';

export function registerBehaviorApi(registry: OpenAPIRegistry) {
  const getTodayBehaviorsResponse = registry.register(
    'GetTodayBehaviorsResponse',
    GetTodayBehaviorsResponseSchema,
  );

  registry.registerPath({
    method: 'get',
    path: '/behavior',
    responses: {
      200: {
        description: "Today's behaviors",
        content: {
          'application/json': {
            schema: getTodayBehaviorsResponse,
          },
        },
      },
    },
  });
}
