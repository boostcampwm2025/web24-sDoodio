import {
  GetTotalCompletedCountResponseSchema,
  type GetTotalCompletedCountResponse,
} from '@web24/shared';

export async function fetchTotalCompletedCount(): Promise<GetTotalCompletedCountResponse> {
  const res = await fetch('/api/stats/total-compledted-count', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  const json = await res.json();
  return GetTotalCompletedCountResponseSchema.parse(json);
}
