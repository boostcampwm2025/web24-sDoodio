import { PostTodayBehaviorResponseSchema, type PostTodayBehaviorResponse } from '@web24/shared';

export async function createTodayBehavior(behaviorId: string): Promise<PostTodayBehaviorResponse> {
  const res = await fetch('/api/today-behaviors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ behaviorId }),
  });

  if (!res.ok) {
    let message = 'Failed to create today behavior';
    try {
      const json = await res.json();
      if (typeof json?.message === 'string') {
        message = json.message;
      } else if (Array.isArray(json?.message)) {
        message = json.message.join(', ');
      }
    } catch {
      // ignore parse errors and keep fallback message
    }
    throw new Error(message);
  }

  const json = await res.json();
  return PostTodayBehaviorResponseSchema.parse(json);
}
