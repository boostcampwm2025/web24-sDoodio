import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DeletePushSubscriptionResponseSchema,
  type DeletePushSubscriptionRequest,
} from '@web24/shared';
import { unregisterPushSubscription } from './unregisterPushSubscription.api';

describe('unregisterPushSubscription', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('push subscription을 삭제하고 응답을 반환한다', async () => {
    const request: DeletePushSubscriptionRequest = {
      endpoint: 'https://example.com/push',
    };
    const mockResponse = { success: true };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await unregisterPushSubscription(request);

    expect(fetch).toHaveBeenCalledWith('/api/push/subscriptions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    expect(result).toEqual(DeletePushSubscriptionResponseSchema.parse(mockResponse));
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    const request: DeletePushSubscriptionRequest = {
      endpoint: 'https://example.com/push',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(unregisterPushSubscription(request)).rejects.toThrow(
      'Failed to register push subscription',
    );
  });

  it('응답 스키마가 유효하지 않으면 에러를 던진다', async () => {
    const request: DeletePushSubscriptionRequest = {
      endpoint: 'https://example.com/push',
    };
    const invalidResponse = { success: 'true' };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    await expect(unregisterPushSubscription(request)).rejects.toThrow();
  });
});
