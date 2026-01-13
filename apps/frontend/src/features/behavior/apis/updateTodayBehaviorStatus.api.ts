import {
  PatchTodayBehaviorStatusResponseSchema,
  type PatchTodayBehaviorStatusResponse,
  type TodayBehaviorStatus,
} from '@web24/shared';

export async function updateTodayBehaviorStatus(
  id: string,
  status: TodayBehaviorStatus,
): Promise<PatchTodayBehaviorStatusResponse> {
  const res = await fetch(`/api/today-behaviors/${id}/status`, {
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
  return PatchTodayBehaviorStatusResponseSchema.parse(json);
}
