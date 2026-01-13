import type { Behavior } from '@web24/shared';

export async function fetchAllBehaviors(): Promise<Behavior[]> {
  const res = await fetch('/api/behavior/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch all behaviors');
  }

  return res.json();
}
