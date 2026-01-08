import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GoalTemplateButton } from './GoalTemplateButton';

describe('GoalTemplateButton', () => {
  it('라벨과 버튼이 렌더링된다', () => {
    render(<GoalTemplateButton label="건강" selected={false} onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: '건강' })).toBeInTheDocument();
  });

  it('클릭 시 onClick이 호출된다', () => {
    const onClick = vi.fn();

    render(<GoalTemplateButton label="공부" selected={false} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: '공부' }));

    expect(onClick).toHaveBeenCalled();
  });

  it('selected가 true면 aria-pressed가 true다', () => {
    render(<GoalTemplateButton label="건강" selected onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: '건강' })).toHaveAttribute('aria-pressed', 'true');
  });
});
