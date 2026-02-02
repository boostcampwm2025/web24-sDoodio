import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { LogoutResponseSchema, UserMeResponseSchema, LoginResponseSchema } from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerAuthApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const userMeResponse = registry.register('UserMeResponse', UserMeResponseSchema);
  const loginResponse = registry.register('LoginResponse', LoginResponseSchema);
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
            schema: loginResponse,
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

  registry.registerPath({
    method: 'get',
    path: '/auth/google',
    description: 'Redirect to google login page',
    responses: {
      302: { description: 'Redirect to google login page' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/auth/google/callback',
    description: 'After google authentication, create a session and redirect to the frontend.',
    responses: {
      302: { description: 'Redirect to new user (/onboarding) or existing user (/) ' },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/auth/settings/behavior-ratio',
    request: {
      body: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                behaviorRatio: { type: 'number' },
              },
              required: ['behaviorRatio'],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Behavior ratio updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
              },
              required: ['success'],
            },
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
