import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fetchGoalStamps } from '@/features/goal/apis/fetchGoalStamps.api';
import { GoalDetailPage } from './GoalDetailPage';

// fetchGoalStamps mock
vi.mock('@/features/goal/apis/fetchGoalStamps.api', () => ({
  fetchGoalStamps: vi.fn(),
}));

// GoalStampBoard, GoalBehaviorList mock
vi.mock('@/features/goal/components/GoalStampBoard', () => ({
  GoalStampBoard: ({ stamps }: { stamps: unknown[] }) => (
    <div data-testid="goal-stamp-board">stamps:{stamps.length}</div>
  ),
}));

vi.mock('@/features/goal/components/GoalBehaviorList', () => ({
  GoalBehaviorList: () => <div data-testid="goal-behavior-list" />,
}));

describe('GoalDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // GoalDetailPage에서 현재는 mockGoal 사용, title만 교체
    // 필요한 경우 goalId로 가져오는 API도 Mock 가능
    (fetchGoalStamps as any).mockResolvedValue([]);
  });

  function renderPage(goalId = 'goal-abc') {
    return render(
      <MemoryRouter initialEntries={[`/goals/${goalId}`]}>
        <Routes>
          <Route path="/goals/:goalId" element={<GoalDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('goalId로 스탬프 API를 호출한다', async () => {
    (fetchGoalStamps as any).mockResolvedValueOnce([]);
    renderPage('goal-abc');

    await waitFor(() => {
      expect(fetchGoalStamps).toHaveBeenCalledWith('goal-abc');
    });
  });

  it('가져온 스탬프 개수를 표시한다', async () => {
    (fetchGoalStamps as any).mockResolvedValueOnce([
      { id: 's1', difficulty: '몰입하기' },
      { id: 's2', difficulty: '시작하기' },
    ]);

    renderPage();

    const text = await screen.findByText(/달성한 스탬프/);
    expect(text).toHaveTextContent('2');
  });

  it('GoalStampBoard에 stamps를 전달한다', async () => {
    (fetchGoalStamps as any).mockResolvedValueOnce([
      { id: 's1', difficulty: '시작하기' },
      { id: 's2', difficulty: '몰입하기' },
      { id: 's3', difficulty: '이어가기' },
    ]);

    renderPage();

    const board = await screen.findByTestId('goal-stamp-board');
    expect(board).toHaveTextContent('stamps:3');
  });

  it('GoalBehaviorList를 렌더링한다', () => {
    renderPage();
    expect(screen.getByTestId('goal-behavior-list')).toBeInTheDocument();
  });
});
