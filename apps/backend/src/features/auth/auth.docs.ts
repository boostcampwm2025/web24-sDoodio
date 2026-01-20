import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { LogoutResponseSchema, UserMeResponseSchema } from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerAuthApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const userMeResponse = registry.register('UserMeResponse', UserMeResponseSchema);
  const logoutResponse = registry.register('LogoutResponse', LogoutResponseSchema);
  const { errorResponse } = common;

  registry.registerPath({
    method: 'post',
    path: '/auth/guest',
    responses: {
      201: {
        description: 'Guest user created and logged in',
        content: {
          'application/json': {
            schema: userMeResponse,
          },
        },
      },
      400: {
        description: 'Already logged in',
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
    path: '/auth/me',
    responses: {
      200: {
        description: 'Current user info',
        content: {
          'application/json': {
            schema: userMeResponse,
          },
        },
      },
      401: {
        description: 'Not logged in',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    responses: {
      200: {
        description: 'Logged out',
        content: {
          'application/json': {
            schema: logoutResponse,
          },
        },
      },
      401: {
        description: 'Not logged in',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
    },
  });
}
