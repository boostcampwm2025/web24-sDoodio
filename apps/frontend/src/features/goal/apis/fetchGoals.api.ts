import { GetGoalsResponseSchema, type GetGoalsResponse } from '@web24/shared';

export async function fetchGoals(): Promise<GetGoalsResponse> {
  const res = await fetch('/api/goals', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return GetGoalsResponseSchema.parse(json);
}
