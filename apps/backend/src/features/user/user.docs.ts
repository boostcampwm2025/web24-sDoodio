import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { CreateUserResponseSchema } from '@web24/shared';

export function registerUserApi(registry: OpenAPIRegistry) {
  const createUserResponse = registry.register('CreateUserResponse', CreateUserResponseSchema);

  registry.registerPath({
    method: 'post',
    path: '/test/user',
    responses: {
      201: {
        description: 'User created',
        content: {
          'application/json': {
            schema: createUserResponse,
          },
        },
      },
    },
  });
}
