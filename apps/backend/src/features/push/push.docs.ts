import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetVapidPublicKeyResponseSchema,
  RegisterPushSubscriptionRequestSchema,
  RegisterPushSubscriptionResponseSchema,
  DeletePushSubscriptionRequestSchema,
  DeletePushSubscriptionResponseSchema,
  SendPushNotificationRequestSchema,
  SendPushNotificationResponseSchema,
} from '@web24/shared';

type CommonSchemas = {
  errorResponse: ReturnType<OpenAPIRegistry['register']>;
};

export function registerPushApi(registry: OpenAPIRegistry, common: CommonSchemas) {
  const getVapidPublicKeyResponse = registry.register(
    'GetVapidPublicKeyResponse',
    GetVapidPublicKeyResponseSchema,
  );
  const registerPushSubscriptionRequest = registry.register(
    'RegisterPushSubscriptionRequest',
    RegisterPushSubscriptionRequestSchema,
  );
  const registerPushSubscriptionResponse = registry.register(
    'RegisterPushSubscriptionResponse',
    RegisterPushSubscriptionResponseSchema,
  );
  const deletePushSubscriptionRequest = registry.register(
    'DeletePushSubscriptionRequest',
    DeletePushSubscriptionRequestSchema,
  );
  const deletePushSubscriptionResponse = registry.register(
    'DeletePushSubscriptionResponse',
    DeletePushSubscriptionResponseSchema,
  );
  const sendPushNotificationRequest = registry.register(
    'SendPushNotificationRequest',
    SendPushNotificationRequestSchema,
  );
  const sendPushNotificationResponse = registry.register(
    'SendPushNotificationResponse',
    SendPushNotificationResponseSchema,
  );

  const { errorResponse } = common;

  registry.registerPath({
    method: 'get',
    path: '/push/vapid-public-key',
    responses: {
      200: {
        description: 'VAPID 공개키를 반환한다.',
        content: {
          'application/json': {
            schema: getVapidPublicKeyResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/push/subscriptions',
    security: [{ sessionAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerPushSubscriptionRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '푸시 구독 정보를 등록하거나 업데이트한다.',
        content: {
          'application/json': {
            schema: registerPushSubscriptionResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/push/subscriptions',
    security: [{ sessionAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: deletePushSubscriptionRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: '푸시 구독 정보를 삭제한다.',
        content: {
          'application/json': {
            schema: deletePushSubscriptionResponse,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/push/notifications/test',
    security: [{ sessionAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: sendPushNotificationRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: '테스트 푸시 알림을 전송한다.',
        content: {
          'application/json': {
            schema: sendPushNotificationResponse,
          },
        },
      },
      404: {
        description: '사용자를 찾을 수 없음',
        content: {
          'application/json': {
            schema: errorResponse,
          },
        },
      },
    },
  });
}
