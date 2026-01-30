import { DomainError } from '@/shared/errors/domain-error';
import {
  CreateGoalResponseSchema,
  ERROR_MESSAGE_PREFIX,
  type CreateGoalRequest,
  type CreateGoalResponse,
} from '@web24/shared';

export async function createGoal(request: CreateGoalRequest): Promise<CreateGoalResponse> {
  const response = await fetch(`/api/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    if (errorJson.message.startsWith(ERROR_MESSAGE_PREFIX)) {
      const errorMessage = errorJson.message.replace(ERROR_MESSAGE_PREFIX, '').trim();
      throw new DomainError(errorMessage);
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  const json = await response.json();
  return CreateGoalResponseSchema.parse(json);
}
