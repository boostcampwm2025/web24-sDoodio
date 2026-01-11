import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registerBehaviorApi } from './behavior.docs';
import { registerGoalApi } from './goal.docs';
import { registerSampleApi } from './sample.docs';
import { registerUserApi } from './user.docs';

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
