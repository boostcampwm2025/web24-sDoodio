import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GetStatInsightsResponse } from '@web24/shared';
import { StatInsightsGrid } from './StatInsightsGrid';
import { fetchStatInsights } from '../apis/fetchStatInsights.api';

vi.mock('../apis/fetchStatInsights.api', () => ({
  fetchStatInsights: vi.fn(),
}));

vi.mock('seedrandom', () => ({
  default: () => () => 0.999,
}));

describe('StatInsightsGrid', () => {
  const mockedFetchStatInsights = vi.mocked(fetchStatInsights);

  const mockInsights: GetStatInsightsResponse = {
    statDate: '2026-01-22',
    dailyDifficultyCompletedCounts: {
      마음열기: 1,
      시작하기: 2,
      이어가기: 0,
      몰입하기: 0,
      AI: 0,
    },
    weeklyDifficultyCompletedCounts: {
      마음열기: 0,
      시작하기: 1,
      이어가기: 2,
      몰입하기: 3,
      AI: 0,
    },
    totalDifficultyCompletedCounts: {
      마음열기: 3,
      시작하기: 4,
      이어가기: 5,
      몰입하기: 6,
      AI: 0,
    },
    originCompletedCounts: { system: 2, user: 1 },
    notDoneCounts: { system: 1, user: 0 },
    completionTimeBuckets: {
      '1~7': 0,
      '7~10': 1,
      '10~17': 0,
      '17~20': 2,
      '20~1': 0,
    },
    checkInTotal: 2,
    duduCatchTotal: 1,
    goalCountDegree: 'MORE',
    behaviorCountDegree: 'LESS',
    avgRefreshPerDay: 2.5,
    avgCompletedPerDay: 1.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    mockedFetchStatInsights.mockReturnValue(new Promise(() => {}));
    render(<StatInsightsGrid />);
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('에러가 발생하면 대체 메시지를 표시한다', async () => {
    mockedFetchStatInsights.mockRejectedValue(new Error('fail'));
    render(<StatInsightsGrid />);

    await waitFor(() => {
      expect(screen.getByText('조금 더 쌓이면 보여줄 수 있어요.')).toBeInTheDocument();
    });
  });

  it('데이터가 있으면 랜덤 카드 4개를 렌더링한다', async () => {
    mockedFetchStatInsights.mockResolvedValue(mockInsights);
    render(<StatInsightsGrid />);

    await waitFor(() => {
      expect(screen.getByText('두두만 믿고 따라오세요!')).toBeInTheDocument();
    });

    expect(screen.getByText('일 평균 1.5회 수행했어요.')).toBeInTheDocument();
    expect(screen.getByText('어제 가장 많이 한 난이도는 시작하기예요.')).toBeInTheDocument();
    expect(screen.getByText('이번 주에는 몰입하기가 가장 많았어요.')).toBeInTheDocument();
  });
});
