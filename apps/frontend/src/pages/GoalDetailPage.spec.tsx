import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fetchGoalStamps } from '@/features/goal/apis/fetchGoalStamps.api';
import { fetchGoal } from '@/features/goal/apis/fetchGoal.api';
import { GoalDetailPage } from './GoalDetailPage';

// fetchGoalStamps mock
vi.mock('@/features/goal/apis/fetchGoalStamps.api', () => ({
  fetchGoalStamps: vi.fn(),
}));

vi.mock('@/features/goal/apis/fetchGoal.api', () => ({
  fetchGoal: vi.fn(),
}));

// GoalStampBoard, GoalBehaviorList mock
vi.mock('@/features/goal/components/GoalStampBoard', () => ({
  GoalStampBoard: ({ stamps }: { stamps: unknown[] }) => (
    <div data-testid="goal-stamp-board">stamps:{stamps.length}</div>
  ),
}));

vi.mock('@/features/goal/components/GoalBehaviorList', () => ({
  GoalBehaviorList: ({ goalId }: { goalId: string }) => (
    <div data-testid="goal-behavior-list">goal:{goalId}</div>
  ),
}));

describe('GoalDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // GoalDetailPage에서 현재는 mockGoal 사용, title만 교체
    // 필요한 경우 goalId로 가져오는 API도 Mock 가능
    (fetchGoalStamps as any).mockResolvedValue([]);
    (fetchGoal as any).mockResolvedValue({
      id: 'goal-abc',
      title: '건강 목표',
      color: 'pink',
    });
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

  it('goalId로 목표 API를 호출한다', async () => {
    renderPage('goal-abc');

    await waitFor(() => {
      expect(fetchGoal).toHaveBeenCalledWith('goal-abc');
    });
  });

  it('가져온 스탬프 개수를 표시한다', async () => {
    (fetchGoalStamps as any).mockResolvedValueOnce([
      { id: 's1', title: '행동 1', difficulty: '몰입하기', source: 'today' },
      { id: 's2', title: 'AI 행동', difficulty: 'AI', source: 'ai' },
    ]);

    renderPage();

    const texts = await screen.findAllByText(/달성한 스탬프/);
    expect(texts.length).toBeGreaterThan(0);
    texts.forEach((text) => {
      expect(text).toHaveTextContent('2');
    });
  });

  it('GoalStampBoard에 stamps를 전달한다', async () => {
    (fetchGoalStamps as any).mockResolvedValueOnce([
      { id: 's1', title: '행동 1', difficulty: '시작하기', source: 'today' },
      { id: 's2', title: '행동 2', difficulty: '몰입하기', source: 'today' },
      { id: 's3', title: '행동 3', difficulty: '이어가기', source: 'today' },
    ]);

    renderPage();

    const boards = await screen.findAllByTestId('goal-stamp-board');
    expect(boards.length).toBeGreaterThan(0);
    boards.forEach((board) => {
      expect(board).toHaveTextContent('stamps:3');
    });
  });

  it('GoalBehaviorList를 렌더링한다', () => {
    renderPage();
    expect(screen.getAllByTestId('goal-behavior-list').length).toBeGreaterThan(0);
  });
});
