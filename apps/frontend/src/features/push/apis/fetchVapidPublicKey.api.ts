import { GetVapidPublicKeyResponseSchema, type GetVapidPublicKeyResponse } from '@web24/shared';

export async function fetchVapidPublicKey(): Promise<GetVapidPublicKeyResponse> {
  const response = await fetch('/api/push/vapid-public-key');
  if (!response.ok) {
    throw new Error('Failed to fetch VAPID public key');
  }
  const json = await response.json();
  return GetVapidPublicKeyResponseSchema.parse(json);
}
