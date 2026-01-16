import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { AIBehaviorContainer } from './AIBehaviorContainer';

describe('AIBehaviorContainer', () => {
  const mockBehaviors: Behavior[] = [
    {
      id: '1',
      title: 'Behavior 1',
      goalTitle: 'Goal 1',
      goalColor: 'mint',
      isChecked: false,
      difficulty: '몰입하기',
      isRecommended: false,
    },
    {
      id: '2',
      title: 'Behavior 2',
      goalTitle: 'Goal 2',
      goalColor: 'blue',
      isChecked: true,
      difficulty: '마음열기',
      isRecommended: true,
    },
  ];

  it('로딩 중이거나 데이터가 없으면 빈 컨테이너를 렌더링한다', () => {
    const { container } = render(
      <AIBehaviorContainer behaviors={[]} onToggle={vi.fn()} isLoading isMaking={false} />,
    );
    // containerClassName defines the visible empty state
    expect(container.firstChild).toHaveClass('min-h-55');
    expect(screen.queryByText('AI 맞춤 추천')).not.toBeInTheDocument();
  });

  it('isMaking 상태일 때 MakingIndicator를 보여준다', () => {
    render(<AIBehaviorContainer behaviors={[]} onToggle={vi.fn()} isLoading={false} isMaking />);
    expect(screen.getByText('두두가 주머니를 뒤지는 중...')).toBeInTheDocument();
    expect(screen.getByAltText('두두 얼굴')).toBeInTheDocument();
  });

  it('추천 행동 리스트를 올바르게 렌더링한다', () => {
    render(
      <AIBehaviorContainer
        behaviors={mockBehaviors}
        onToggle={vi.fn()}
        isLoading={false}
        isMaking={false}
      />,
    );
    expect(screen.getByText('AI 맞춤 추천')).toBeInTheDocument();
    expect(screen.getByText('Behavior 1')).toBeInTheDocument();
    expect(screen.getByText('Behavior 2')).toBeInTheDocument();
  });

  it('행동 카드를 클릭하면 onToggle이 호출된다', () => {
    const onToggleMock = vi.fn();
    render(
      <AIBehaviorContainer
        behaviors={mockBehaviors}
        onToggle={onToggleMock}
        isLoading={false}
        isMaking={false}
      />,
    );

    const toggleButton = screen.getByLabelText('Behavior 1 완료 토글');
    fireEvent.click(toggleButton);
    expect(onToggleMock).toHaveBeenCalledWith('1');
  });
});
