import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registerAIApi } from 'src/features/ai/ai.docs';
import { registerCommonSchemas } from './common.docs';
import { registerBehaviorApi } from '../../features/behavior/behavior.docs';
import { registerGoalApi } from '../../features/goal/goal.docs';
import { registerAuthApi } from '../../features/auth/auth.docs';
import { registerStatApi } from '../../features/stat/stat.docs';
import { registerPushApi } from '../../features/push/push.docs';

const registry = new OpenAPIRegistry();

const commonSchemas = registerCommonSchemas(registry);

// Register Feature APIs
registerGoalApi(registry);
registerBehaviorApi(registry, commonSchemas);
registerAuthApi(registry, commonSchemas);
registerStatApi(registry, commonSchemas);
registerAIApi(registry, commonSchemas);
registerPushApi(registry, commonSchemas);

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

openApiDocument.components = {
  ...openApiDocument.components,
  securitySchemes: {
    ...openApiDocument.components?.securitySchemes,
    sessionAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
    },
  },
};
