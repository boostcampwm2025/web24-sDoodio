import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BehaviorSelection } from './BehaviorSelection';

describe('BehaviorSelection', () => {
  const mockBehaviors = [
    { id: 'b-1', title: '아침 운동' },
    { id: 'b-2', title: '명상하기' },
  ];
  const mockRecommendations = ['명상하기', '독서 10분', '일기 쓰기'];

  it('추천 항목과 현재 행동 리스트가 정확히 렌더링되어야 한다', () => {
    render(
      <BehaviorSelection
        behaviors={mockBehaviors}
        recommendations={mockRecommendations}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    // 1. 추천 칩 확인 (명상하기는 중복되므로 버튼 role로 명시)
    expect(screen.getByRole('button', { name: /독서 10분/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /일기 쓰기/ })).toBeInTheDocument();

    // 2. 입력된 값 확인 (displayValue는 input 요소를 정확히 매칭)
    expect(screen.getByDisplayValue('아침 운동')).toBeInTheDocument();
    expect(screen.getByDisplayValue('명상하기')).toBeInTheDocument();
  });

  it('추천 항목을 클릭하면 해당 타이틀과 함께 onAdd가 호출되어야 한다', () => {
    const onAdd = vi.fn();
    render(
      <BehaviorSelection
        behaviors={[]}
        recommendations={mockRecommendations}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const chip = screen.getByRole('button', { name: /독서 10분/ });
    fireEvent.click(chip);

    expect(onAdd).toHaveBeenCalledWith('독서 10분');
  });

  it('모두 추가 버튼을 클릭하면 아직 추가되지 않은 모든 추천 항목을 배열로 전달하며 onAdd가 호출되어야 한다', () => {
    const onAdd = vi.fn();
    render(
      <BehaviorSelection
        behaviors={mockBehaviors}
        recommendations={mockRecommendations}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const addAllButton = screen.getByRole('button', { name: /모두 추가/ });
    fireEvent.click(addAllButton);

    expect(onAdd).toHaveBeenCalledWith(['독서 10분', '일기 쓰기']);
  });

  it('이미 추가된 추천 항목(명상하기) 클릭 시 onAdd가 호출되지 않아야 한다', () => {
    const onAdd = vi.fn();
    render(
      <BehaviorSelection
        behaviors={mockBehaviors} // '명상하기'가 이미 있음
        recommendations={mockRecommendations}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={onAdd}
      />,
    );

    // 추천 영역의 '명상하기' 버튼을 찾아 클릭 (isSelected 판별)
    const recommendationButtons = screen.getAllByRole('button', { name: /명상하기/ });
    fireEvent.click(recommendationButtons[0]);

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('직접 추가 버튼을 클릭하면 인자 없이 onAdd가 호출되어야 한다', () => {
    const onAdd = vi.fn();
    render(
      <BehaviorSelection
        behaviors={[]}
        recommendations={[]}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const addButton = screen.getByRole('button', { name: /새로운 행동 직접 쓰기/ });
    fireEvent.click(addButton);

    expect(onAdd).toHaveBeenCalledWith();
  });

  it('입력된 행동의 제목을 수정하면 onChangeBehaviorTitle이 호출되어야 한다', () => {
    const onChangeBehaviorTitle = vi.fn();
    render(
      <BehaviorSelection
        behaviors={mockBehaviors}
        recommendations={[]}
        onChangeBehaviorTitle={onChangeBehaviorTitle}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    const input = screen.getByDisplayValue('아침 운동');
    fireEvent.change(input, { target: { value: '저녁 운동' } });

    expect(onChangeBehaviorTitle).toHaveBeenCalledWith('b-1', '저녁 운동');
  });

  it('지우기 버튼을 클릭하면 onDelete가 호출되어야 한다', () => {
    const onDelete = vi.fn();
    render(
      <BehaviorSelection
        behaviors={mockBehaviors}
        recommendations={[]}
        onChangeBehaviorTitle={vi.fn()}
        onDelete={onDelete}
        onAdd={vi.fn()}
      />,
    );

    const deleteButtons = screen.getAllByRole('button', { name: /지우기/ });
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith('b-1');
  });
});
