import {
  DeletePushSubscriptionResponseSchema,
  type DeletePushSubscriptionRequest,
  type DeletePushSubscriptionResponse,
} from '@web24/shared';

export async function unregisterPushSubscription(
  data: DeletePushSubscriptionRequest,
): Promise<DeletePushSubscriptionResponse> {
  const response = await fetch('/api/push/subscriptions', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to register push subscription');
  }

  const json = await response.json();
  return DeletePushSubscriptionResponseSchema.parse(json);
}
