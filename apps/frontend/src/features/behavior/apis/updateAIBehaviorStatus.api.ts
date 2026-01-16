import {
  PatchAIBehaviorStatusResponseSchema,
  type PatchAIBehaviorStatusResponse,
  type AIBehaviorStatus,
} from '@web24/shared';

export async function updateAIBehaviorStatus(
  id: string,
  status: AIBehaviorStatus,
): Promise<PatchAIBehaviorStatusResponse> {
  const res = await fetch(`/api/today-behaviors/ai/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return PatchAIBehaviorStatusResponseSchema.parse(json);
}
