import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { GetAIBehaviorResponseSchema } from '@web24/shared';

export async function fetchAIBehaviors(): Promise<Behavior[]> {
  const res = await fetch('/api/today-behaviors/ai', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return GetAIBehaviorResponseSchema.parse(json);
}
