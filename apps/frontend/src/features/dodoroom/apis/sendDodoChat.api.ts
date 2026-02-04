import { DodoChatResponseSchema } from '@web24/shared';

export async function sendDodoChat(message: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok && res.status !== 429) {
    throw new Error('Failed to fetch dodo reply');
  }

  const json = await res.json();
  return DodoChatResponseSchema.parse(json);
}
