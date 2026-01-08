import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';

export async function fetchTodayBehaviors(): Promise<Behavior[]> {
  const res = await fetch('/api/behavior', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  return res.json();
}
