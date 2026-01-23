import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStatInsights } from './fetchStatInsights.api';

describe('fetchStatInsights', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('성공 시 인사이트 데이터를 반환한다', async () => {
    const mockData = {
      statDate: '2026-01-22',
      dailyDifficultyCompletedCounts: {
        마음열기: 1,
        시작하기: 2,
        이어가기: 3,
        몰입하기: 4,
        AI: 0,
      },
      weeklyDifficultyCompletedCounts: {
        마음열기: 2,
        시작하기: 3,
        이어가기: 4,
        몰입하기: 5,
        AI: 0,
      },
      totalDifficultyCompletedCounts: {
        마음열기: 10,
        시작하기: 12,
        이어가기: 13,
        몰입하기: 14,
        AI: 0,
      },
      originCompletedCounts: { system: 2, user: 1 },
      notDoneCounts: { system: 1, user: 0 },
      completionTimeBuckets: {
        '1~7': 0,
        '7~10': 1,
        '10~17': 2,
        '17~20': 3,
        '20~1': 4,
      },
      checkInTotal: 3,
      duduCatchTotal: 1,
      goalCountDegree: 'MORE',
      behaviorCountDegree: 'LESS',
      avgRefreshPerDay: 2.5,
      avgCompletedPerDay: 3.1,
    };
    (vi.mocked(fetch) as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchStatInsights();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/stats/insights', expect.any(Object));
  });

  it('요청 실패 시 에러를 던진다', async () => {
    (vi.mocked(fetch) as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchStatInsights()).rejects.toThrow('Failed to fetch stat insights');
  });

  it('스키마 검증에 실패하면 에러를 던진다', async () => {
    const invalidData = { invalid: true };
    (vi.mocked(fetch) as any).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    });

    await expect(fetchStatInsights()).rejects.toThrow();
  });
});
