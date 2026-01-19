import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';

export async function refreshTodayBehaviors(): Promise<Behavior[]> {
  const res = await fetch('/api/today-behaviors/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  return res.json();
}
