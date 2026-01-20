import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Behavior } from '@web24/shared';
import { useGoalBehaviors } from '../hooks/useGoalBehaviors';
import { GoalBehaviorList } from './GoalBehaviorList';

vi.mock('../hooks/useGoalBehaviors', () => ({
  useGoalBehaviors: vi.fn(),
}));

describe('GoalBehaviorList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('전체 필터에서 모든 행동과 건수를 표시한다', () => {
    const mockBehaviors: Behavior[] = [
      { id: 'b1', title: '물 1컵 마시기', difficulty: '마음열기' },
      { id: 'b2', title: '스트레칭 5분', difficulty: '시작하기' },
      { id: 'b3', title: 'AI 추천', difficulty: 'AI' },
    ];

    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: mockBehaviors,
      isLoading: false,
      error: null,
      refetch: async () => {},
    });

    render(
      <GoalBehaviorList
        goalId="goal-1"
        behaviors={mockBehaviors}
        isLoading={false}
        onRefetch={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: /전체 3/ })).toBeInTheDocument();
    expect(screen.getByText('물 1컵 마시기')).toBeInTheDocument();
    expect(screen.getByText('스트레칭 5분')).toBeInTheDocument();
    expect(screen.getByText('AI 추천')).toBeInTheDocument();
  });

  it('난이도 칩을 선택하면 해당 난이도만 보여준다', () => {
    const mockBehaviors: Behavior[] = [
      { id: 'b1', title: '물 1컵 마시기', difficulty: '마음열기' },
      { id: 'b2', title: '스트레칭 5분', difficulty: '시작하기' },
    ];

    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: mockBehaviors,
      isLoading: false,
      error: null,
      refetch: async () => {},
    });

    render(
      <GoalBehaviorList
        goalId="goal-1"
        behaviors={mockBehaviors}
        isLoading={false}
        onRefetch={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /시작하기/ }));

    expect(screen.queryByText('물 1컵 마시기')).not.toBeInTheDocument();
    expect(screen.getByText('스트레칭 5분')).toBeInTheDocument();
  });
});
