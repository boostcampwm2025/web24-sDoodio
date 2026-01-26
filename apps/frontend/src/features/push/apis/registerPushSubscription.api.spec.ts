import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterPushSubscriptionResponseSchema } from '@web24/shared';
import { registerPushSubscription } from './registerPushSubscription.api';

const createPushSubscriptionMock = (
  overrides: Partial<PushSubscriptionJSON> = {},
): PushSubscription => {
  const json: PushSubscriptionJSON = {
    endpoint: overrides.endpoint ?? 'https://example.com/push',
    expirationTime: overrides.expirationTime ?? null,
    keys: {
      p256dh: 'p256dh-key',
      auth: 'auth-key',
      ...(overrides.keys ?? {}),
    },
  };

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    options: {} as PushSubscriptionOptions,
    getKey: vi.fn().mockReturnValue(new ArrayBuffer(1)),
    toJSON: () => json,
    unsubscribe: vi.fn().mockResolvedValue(true),
  } as PushSubscription;
};

describe('registerPushSubscription', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('push subscription을 등록하고 응답을 반환한다', async () => {
    const subscription = createPushSubscriptionMock();
    const mockResponse = { success: true };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await registerPushSubscription(subscription);

    expect(fetch).toHaveBeenCalledWith('/api/push/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    expect(result).toEqual(RegisterPushSubscriptionResponseSchema.parse(mockResponse));
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    const subscription = createPushSubscriptionMock();

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(registerPushSubscription(subscription)).rejects.toThrow(
      'Failed to register push subscription',
    );
  });

  it('응답 스키마가 유효하지 않으면 에러를 던진다', async () => {
    const subscription = createPushSubscriptionMock();
    const invalidResponse = { success: 'true' };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    await expect(registerPushSubscription(subscription)).rejects.toThrow();
  });
});
