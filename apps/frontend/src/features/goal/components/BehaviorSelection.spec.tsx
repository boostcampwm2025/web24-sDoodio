import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BehaviorSelection } from './BehaviorSelection';

describe('BehaviorSelection', () => {
  const behaviors = [
    { id: 'behavior-1', title: '물 1컵 마시기' },
    { id: 'behavior-2', title: '스트레칭' },
  ];

  it('행동 입력 목록이 렌더링된다', () => {
    render(
      <BehaviorSelection
        behaviors={behaviors}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('물 1컵 마시기')).toBeInTheDocument();
    expect(screen.getByDisplayValue('스트레칭')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('입력값 변경 시 onChangeBehaviorTitle이 호출된다', () => {
    const onChangeBehaviorTitle = vi.fn();

    render(
      <BehaviorSelection
        behaviors={behaviors}
        onChangeBehaviorTitle={onChangeBehaviorTitle}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    const [firstInput] = screen.getAllByRole('textbox');
    fireEvent.change(firstInput, { target: { value: '물 2컵 마시기' } });

    expect(onChangeBehaviorTitle).toHaveBeenCalledWith('behavior-1', '물 2컵 마시기');
  });

  it('삭제 버튼 클릭 시 onDelete가 호출된다', () => {
    const onDelete = vi.fn();

    render(
      <BehaviorSelection
        behaviors={behaviors}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={onDelete}
        onAdd={vi.fn()}
      />,
    );

    const [firstDeleteButton] = screen.getAllByRole('button', {
      name: '지우기',
    });
    fireEvent.click(firstDeleteButton);

    expect(onDelete).toHaveBeenCalledWith('behavior-1');
  });

  it('추가 버튼 클릭 시 onAdd가 호출된다', () => {
    const onAdd = vi.fn();

    render(
      <BehaviorSelection
        behaviors={behaviors}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const buttons = screen.getAllByRole('button');
    const addButton = buttons[buttons.length - 1];
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalled();
  });
});
