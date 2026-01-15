import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { GoalSummary, Behavior } from '@web24/shared';
import { GoalCard } from './GoalCard';
import { useGoalBehaviors } from '../hooks/useGoalBehaviors';

vi.mock('../hooks/useGoalBehaviors', () => ({
  useGoalBehaviors: vi.fn(),
}));

describe('GoalCard', () => {
  const mockGoal: GoalSummary = {
    id: 'goal-1',
    title: '건강',
    color: 'mint',
    behaviorCount: 1,
  };

  const mockBehaviors: Behavior[] = [
    {
      id: 'b1',
      title: '물 2L 마시기',
      goalId: 'goal-1',
      difficulty: '몰입하기',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('목표 제목과 행동 개수를 렌더링한다', () => {
    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: [],
    } as any);

    render(<GoalCard goal={mockGoal} isOpen={false} onToggle={vi.fn()} />);

    expect(screen.getByText('건강')).toBeInTheDocument();
    expect(screen.getByText('1개의 행동')).toBeInTheDocument();
  });

  it('닫혀 있을 때 행동 컨테이너가 접힌 상태다', () => {
    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: mockBehaviors,
    } as any);

    render(<GoalCard goal={mockGoal} isOpen={false} onToggle={vi.fn()} />);

    const behaviorContainer = screen.getByText('물 2L 마시기').closest('div')
      ?.parentElement?.parentElement;

    expect(behaviorContainer).toHaveClass('max-h-0');
    expect(behaviorContainer).toHaveClass('opacity-0');
  });

  it('열려 있고 props로 behaviors가 있으면 행동 리스트를 렌더링한다', () => {
    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: [],
    } as any);

    render(<GoalCard goal={mockGoal} behaviors={mockBehaviors} isOpen onToggle={vi.fn()} />);

    expect(screen.getByText('물 2L 마시기')).toBeInTheDocument();
  });

  it('열려 있지만 행동이 없으면 빈 상태 메시지를 보여준다', () => {
    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: [],
    } as any);

    render(<GoalCard goal={{ ...mockGoal, behaviorCount: 0 }} isOpen onToggle={vi.fn()} />);

    expect(screen.getByText('등록된 행동이 안보여요')).toBeInTheDocument();
  });

  it('토글 버튼 클릭 시 onToggle이 호출된다', () => {
    vi.mocked(useGoalBehaviors).mockReturnValue({
      behaviors: [],
    } as any);

    const onToggleMock = vi.fn();

    render(<GoalCard goal={mockGoal} isOpen={false} onToggle={onToggleMock} />);

    fireEvent.click(screen.getByRole('button', { name: /펼치기|접기/ }));

    expect(onToggleMock).toHaveBeenCalled();
  });
});
