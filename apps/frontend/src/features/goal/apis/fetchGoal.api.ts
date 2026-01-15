import { GetGoalResponseSchema, type GetGoalResponse } from '@web24/shared';

export async function fetchGoal(goalId: string): Promise<GetGoalResponse> {
  const res = await fetch(`/api/goals/${goalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch goal');
  }

  const json = await res.json();
  return GetGoalResponseSchema.parse(json);
}
