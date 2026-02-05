import { GetDifficultyStatsResponseSchema } from '@web24/shared';

export async function fetchDifficultyStats() {
  const res = await fetch('/api/stats/difficulty', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch difficulty stats');
  }

  const json = await res.json();
  return GetDifficultyStatsResponseSchema.parse(json);
}
