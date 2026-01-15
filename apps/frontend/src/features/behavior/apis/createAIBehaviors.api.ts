import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { PostAIBehaviorResponseSchema } from '@web24/shared';

export async function createAIBehaviors(): Promise<Behavior[]> {
  const res = await fetch('/api/today-behaviors/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return PostAIBehaviorResponseSchema.parse(json);
}
