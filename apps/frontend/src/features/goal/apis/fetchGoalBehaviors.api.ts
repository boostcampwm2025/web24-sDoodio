import type { Behavior } from '@web24/shared';

export async function fetchGoalBehaviors(goalId: string): Promise<Behavior[]> {
  const res = await fetch(`/api/goals/${goalId}/behaviors`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch behaviors');
  }

  return res.json();
}
