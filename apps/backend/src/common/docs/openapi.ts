import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registerSampleApi } from './sample.docs';
import { registerBehaviorApi } from '../../features/behavior/behavior.docs';
import { registerGoalApi } from '../../features/goal/goal.docs';
import { registerUserApi } from '../../features/user/user.docs';

const registry = new OpenAPIRegistry();

// Register Feature APIs
registerSampleApi(registry);
registerUserApi(registry);
registerGoalApi(registry);
registerBehaviorApi(registry);

type OpenApiDocument = ReturnType<OpenApiGeneratorV3['generateDocument']>;

export const openApiDocument: OpenApiDocument = new OpenApiGeneratorV3(
  registry.definitions,
).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Web24 API',
    version: '0.0.0',
  },
  servers: [{ url: '/api' }],
});
