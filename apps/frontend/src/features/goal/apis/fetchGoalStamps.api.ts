import { GetGoalStampsResponseSchema, type GetGoalStampsResponse } from '@web24/shared';

export async function fetchGoalStamps(goalId: string): Promise<GetGoalStampsResponse> {
  const res = await fetch(`/api/goals/${goalId}/stamps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch goal stamps');
  }

  const json = await res.json();
  return GetGoalStampsResponseSchema.parse(json);
}
