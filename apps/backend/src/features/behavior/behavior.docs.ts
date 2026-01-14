import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  GetTodayBehaviorsResponseSchema,
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
}
