import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTopBehaviors } from '@/features/stat/apis/fetchTopBehaviors.api';
import { fetchTotalCompletedCount } from '@/features/stat/apis/fetchTotalCompletedCount.api';
import { StatsPage } from './StatsPage';

vi.mock('@/features/stat/apis/fetchTopBehaviors.api', () => ({
  fetchTopBehaviors: vi.fn(),
}));

vi.mock('@/features/stat/apis/fetchTotalCompletedCount.api', () => ({
  fetchTotalCompletedCount: vi.fn(),
}));

vi.mock('@/features/stat/components/AccumulatedBehaviorStats', () => ({
  AccumulatedBehaviorStats: ({ allTopBehaviors, goalTopBehaviors }: any) => (
    <div data-testid="accumulated-stats">
      <span>all-count:{allTopBehaviors.totalCount}</span>
      <span>goal-count:{goalTopBehaviors.length}</span>
    </div>
  ),
}));

describe('StatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API 데이터를 fetch하고 화면에 정상적으로 렌더링한다', async () => {
    (fetchTopBehaviors as any).mockResolvedValue({
      all: {
        totalCount: 10,
        items: [],
      },
      goals: [
        {
          id: 'g1',
          goalTitle: '목표 1',
          goalColor: 'pink',
          totalCount: 5,
          items: [],
        },
      ],
    });

    (fetchTotalCompletedCount as any).mockResolvedValue({
      count: 184,
    });

    render(<StatsPage />);

    // 총 완료 횟수
    await waitFor(() => {
      expect(screen.getByText('184')).toBeInTheDocument();
    });

    // 하위 컴포넌트 렌더 확인
    expect(screen.getByTestId('accumulated-stats')).toBeInTheDocument();
    expect(screen.getByText('all-count:10')).toBeInTheDocument();
    expect(screen.getByText('goal-count:1')).toBeInTheDocument();

    // API 호출 검증
    expect(fetchTopBehaviors).toHaveBeenCalledTimes(1);
    expect(fetchTotalCompletedCount).toHaveBeenCalledTimes(1);
  });
});
