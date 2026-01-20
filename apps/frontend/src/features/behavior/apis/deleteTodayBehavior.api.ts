import { DeleteTodayBehaviorResponseSchema, type DeleteTodayBehaviorResponse } from '@web24/shared';

export async function deleteTodayBehavior(id: string): Promise<DeleteTodayBehaviorResponse> {
  const res = await fetch(`/api/today-behaviors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return DeleteTodayBehaviorResponseSchema.parse(json);
}
