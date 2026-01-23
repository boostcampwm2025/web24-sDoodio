import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTotalCompletedCount } from './fetchTotalCompletedCount.api';

describe('fetchTotalCompletedCount', () => {
  const mockResponse = {
    count: 184,
  };

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('성공적으로 총 완료 횟수를 fetch하고 schema parse 결과를 반환한다', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchTotalCompletedCount();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/stats/total-completed-count',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(result.count).toBe(184);
  });

  it('응답이 ok가 아니면 에러를 throw한다', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(fetchTotalCompletedCount()).rejects.toThrow('Failed to fetch');
  });

  it('응답이 schema와 맞지 않으면 Zod 에러를 throw한다', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        wrong: 'data',
      }),
    });

    await expect(fetchTotalCompletedCount()).rejects.toThrow();
  });
});
