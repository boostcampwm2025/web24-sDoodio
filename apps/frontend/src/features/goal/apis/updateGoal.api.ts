import {
  UpdateGoalResponseSchema,
  type UpdateGoalRequest,
  type UpdateGoalResponse,
} from '@web24/shared';

export async function updateGoal(
  id: string,
  request: UpdateGoalRequest,
): Promise<UpdateGoalResponse> {
  const response = await fetch(`/api/goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const json = await response.json();
  return UpdateGoalResponseSchema.parse(json);
}
