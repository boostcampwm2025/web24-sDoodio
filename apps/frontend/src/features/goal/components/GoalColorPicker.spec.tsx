import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GOAL_COLORS } from '@web24/shared';
import { GoalColorPicker } from './GoalColorPicker';

describe('GoalColorPicker', () => {
  it('색상 버튼이 모두 렌더링된다', () => {
    render(<GoalColorPicker selectedColor={GOAL_COLORS[0]} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(GOAL_COLORS.length);
    GOAL_COLORS.forEach((color) => {
      expect(screen.getByLabelText(`Select ${color} color`)).toBeInTheDocument();
    });
  });

  it('색상 버튼 클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn();

    render(<GoalColorPicker selectedColor={GOAL_COLORS[0]} onSelect={onSelect} />);

    fireEvent.click(screen.getByLabelText(`Select ${GOAL_COLORS[1]} color`));

    expect(onSelect).toHaveBeenCalledWith(GOAL_COLORS[1]);
  });

  it('선택된 색상에는 체크 표시가 나타난다', () => {
    const selectedColor = 'blue';

    render(<GoalColorPicker selectedColor={selectedColor} onSelect={vi.fn()} />);

    const selectedButton = screen.getByLabelText(`Select ${selectedColor} color`);

    expect(selectedButton.className).toContain('ring-4');
    expect(selectedButton.className).toContain('ring-goal-blue');
    expect(selectedButton.querySelector('svg')).not.toBeNull();
  });
});
