import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetVapidPublicKeyResponseSchema } from '@web24/shared';
import { fetchVapidPublicKey } from './fetchVapidPublicKey.api';

describe('fetchVapidPublicKey', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('VAPID 공개키를 정상적으로 반환한다', async () => {
    const mockResponse = { publicKey: 'public-key' };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchVapidPublicKey();

    expect(fetch).toHaveBeenCalledWith('/api/push/vapid-public-key');
    expect(result).toEqual(GetVapidPublicKeyResponseSchema.parse(mockResponse));
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(fetchVapidPublicKey()).rejects.toThrow('Failed to fetch VAPID public key');
  });

  it('응답 스키마가 유효하지 않으면 에러를 던진다', async () => {
    const invalidResponse = { publicKey: '' };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    await expect(fetchVapidPublicKey()).rejects.toThrow();
  });
});
