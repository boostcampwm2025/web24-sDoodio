import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDifficultyStats } from './fetchDifficultyStats.api';

describe('fetchDifficultyStats', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('성공 시 통계 데이터를 반환한다', async () => {
    const mockData = [{ 마음열기: 1, 시작하기: 2, 이어가기: 0, 몰입하기: 0, AI: 0 }];
    (vi.mocked(fetch) as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchDifficultyStats();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/stats/difficulty', expect.any(Object));
  });

  it('요청 실패 시 에러를 던진다', async () => {
    (vi.mocked(fetch) as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchDifficultyStats()).rejects.toThrow('Failed to fetch difficulty stats');
  });

  it('스키마 검증에 실패하면 에러를 던진다', async () => {
    const invalidData = [{ invalid: 'data' }];
    (vi.mocked(fetch) as any).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    });

    await expect(fetchDifficultyStats()).rejects.toThrow();
  });
});
