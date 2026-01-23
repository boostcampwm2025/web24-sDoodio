import { GetTopBehaviorsStatResponseSchema, type GetTopBehaviorsStatResponse } from '@web24/shared';

export async function fetchTopBehaviors(): Promise<GetTopBehaviorsStatResponse> {
  const res = await fetch('/api/stats/top-behaviors', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return GetTopBehaviorsStatResponseSchema.parse(json);
}
