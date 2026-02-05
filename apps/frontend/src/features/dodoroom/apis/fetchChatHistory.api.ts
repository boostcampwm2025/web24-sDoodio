import { DodoChatHistoryResponseSchema } from '@web24/shared';

export async function fetchChatHistory(cursor?: string, limit: number = 10) {
  const params = new URLSearchParams();
  if (cursor) {
    params.append('cursor', cursor);
  }
  params.append('limit', limit.toString());

  const res = await fetch(`/api/chat/history?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch chat history');
  }

  const json = await res.json();
  return DodoChatHistoryResponseSchema.parse(json);
}
