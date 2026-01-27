import {
  RegisterPushSubscriptionResponseSchema,
  type RegisterPushSubscriptionResponse,
} from '@web24/shared';

export async function registerPushSubscription(
  subscription: PushSubscription,
): Promise<RegisterPushSubscriptionResponse> {
  const response = await fetch('/api/push/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to register push subscription');
  }

  const json = await response.json();
  return RegisterPushSubscriptionResponseSchema.parse(json);
}
