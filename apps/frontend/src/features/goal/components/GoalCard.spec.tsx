import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { GoalSummary, Behavior } from '@web24/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { GoalCard } from './GoalCard';

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

  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient();
  });

  it('목표 제목과 행동 개수를 렌더링한다', () => {
    queryClient.setQueryData(['goalBehaviors', 'goal-1'], []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GoalCard goal={mockGoal} isOpen={false} onToggle={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('건강')).toBeInTheDocument();
    expect(screen.getByText('1개의 행동')).toBeInTheDocument();
  });

  it('닫혀 있을 때 행동 컨테이너가 접힌 상태다', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GoalCard goal={mockGoal} behaviors={mockBehaviors} isOpen={false} onToggle={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const behaviorContainer = screen.getByText('물 2L 마시기').closest('.transition-all');

    expect(behaviorContainer).toHaveClass('max-h-0');
    expect(behaviorContainer).toHaveClass('opacity-0');
  });

  it('열려 있고 props로 behaviors가 있으면 행동 리스트를 렌더링한다', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GoalCard goal={mockGoal} behaviors={mockBehaviors} isOpen={false} onToggle={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('물 2L 마시기')).toBeInTheDocument();
  });

  it('열려 있지만 행동이 없으면 빈 상태 메시지를 보여준다', () => {
    queryClient.setQueryData(['goalBehaviors', 'goal-1'], []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GoalCard goal={mockGoal} isOpen={false} onToggle={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('등록된 행동이 안보여요')).toBeInTheDocument();
  });

  it('토글 버튼 클릭 시 onToggle이 호출된다', () => {
    queryClient.setQueryData(['goalBehaviors', 'goal-1'], []);

    const onToggleMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GoalCard goal={mockGoal} isOpen={false} onToggle={onToggleMock} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /펼치기|접기/ }));

    expect(onToggleMock).toHaveBeenCalled();
  });
});
