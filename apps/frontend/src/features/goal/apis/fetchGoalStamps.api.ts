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
  const stamps = GetGoalStampsResponseSchema.parse(json);
  // updatedAt 기준 최신순(내림차순) 정렬
  return [...stamps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
