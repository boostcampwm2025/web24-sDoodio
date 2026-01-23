import { GetStatInsightsResponseSchema } from '@web24/shared';

export async function fetchStatInsights() {
  const res = await fetch('/api/stats/insights', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch stat insights');
  }

  const json = await res.json();
  return GetStatInsightsResponseSchema.parse(json);
}
