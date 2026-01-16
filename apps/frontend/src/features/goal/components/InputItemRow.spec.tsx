import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InputItemRow } from './InputItemRow';

describe('InputItemRow', () => {
  it('기본 variant는 입력 필드를 렌더링한다', () => {
    render(<InputItemRow value="물 1컵 마시기" placeholder="행동 이름" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('물 1컵 마시기')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('행동 이름')).toBeInTheDocument();
  });

  it('입력값 변경 시 onChange가 호출된다', () => {
    const onChange = vi.fn();

    render(<InputItemRow value="" placeholder="행동 이름" onChange={onChange} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '스트레칭' },
    });

    expect(onChange).toHaveBeenCalledWith('스트레칭');
  });

  it('onDelete가 있으면 삭제 버튼이 보이고 클릭 시 호출된다', () => {
    const onDelete = vi.fn();

    render(
      <InputItemRow
        value="테스트"
        placeholder="행동 이름"
        onChange={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('add variant는 추가 버튼을 렌더링하고 클릭 시 onAdd가 호출된다', () => {
    const onAdd = vi.fn();

    render(<InputItemRow value="" placeholder="행동 추가" variant="add" onAdd={onAdd} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onAdd).toHaveBeenCalled();
  });
});
