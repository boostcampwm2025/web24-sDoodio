import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewGoal } from './NewGoal';

describe('NewGoal', () => {
  it('목표 이름 입력 필드를 렌더링한다', () => {
    render(<NewGoal title="건강" setTitle={vi.fn()} color="blue" setColor={vi.fn()} />);

    expect(screen.getByText('목표 이름')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('목표 이름을 입력해주세요')).toBeInTheDocument();
  });

  it('목표 이름 변경 시 setTitle이 호출된다', () => {
    const setTitle = vi.fn();

    render(<NewGoal title="" setTitle={setTitle} color="blue" setColor={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '운동' },
    });

    expect(setTitle).toHaveBeenCalledWith('운동');
  });

  it('색상 선택 시 setColor가 호출된다', () => {
    const setColor = vi.fn();

    render(<NewGoal title="" setTitle={vi.fn()} color="blue" setColor={setColor} />);

    fireEvent.click(screen.getByLabelText('Select pink color'));

    expect(setColor).toHaveBeenCalledWith('pink');
  });
});
