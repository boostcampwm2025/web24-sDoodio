import {
  CreateGoalResponseSchema,
  type CreateGoalRequest,
  type CreateGoalResponse,
} from '@web24/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function createGoal(request: CreateGoalRequest): Promise<CreateGoalResponse> {
  const response = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const json = await response.json();
  return CreateGoalResponseSchema.parse(json);
}
