import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BehaviorCard } from './BehaviorCard';

describe('BehaviorCard', () => {
  it('행동 카드가 정상적으로 렌더링된다', () => {
    const onToggle = vi.fn();

    render(
      <BehaviorCard
        behavior={{
          id: 'behavior-1',
          title: '물 1컵 마시기',
          goalTitle: '건강',
          goalColor: 'blue',
          isChecked: false,
          difficulty: '몰입하기',
          isRecommended: true,
        }}
        onToggle={onToggle}
      />,
    );

    expect(screen.getByText('물 1컵 마시기')).toBeInTheDocument();
    expect(screen.getByText('건강')).toBeInTheDocument();
  });

  it('카드의 토글버튼을 클릭하면 onToggle이 호출된다', () => {
    const onToggle = vi.fn();

    render(
      <BehaviorCard
        behavior={{
          id: 'behavior-2',
          title: '스트레칭',
          goalTitle: '운동',
          goalColor: 'pink',
          isChecked: false,
          difficulty: '시작하기',
          isRecommended: false,
        }}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /스트레칭 완료 토글/ }));
    expect(onToggle).toHaveBeenCalled();
  });
});
