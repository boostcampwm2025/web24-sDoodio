import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NewGoalFrame, type NewGoalFrameStep } from './NewGoalFrame';

const steps: NewGoalFrameStep[] = [
  {
    step: 1,
    headerText: '첫 번째 단계',
    dialogue: '대사 1',
    content: <div>콘텐츠 1</div>,
  },
  {
    step: 2,
    headerText: '두 번째 단계',
    dialogue: '대사 2',
    content: <div>콘텐츠 2</div>,
    unskippable: true,
  },
];

describe('NewGoalFrame', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('현재 스텝의 헤더/대사/콘텐츠를 렌더링한다', () => {
    render(
      <NewGoalFrame
        currStepIdx={0}
        steps={steps}
        progressSteps={[1, 2]}
        onMove={vi.fn()}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByText('첫 번째 단계')).toBeInTheDocument();
    expect(screen.getByText('대사 1')).toBeInTheDocument();
    expect(screen.getByText('콘텐츠 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'skip' })).toBeInTheDocument();
  });

  it('unskippable 스텝에서는 skip 버튼이 보이지 않는다', () => {
    render(
      <NewGoalFrame
        currStepIdx={1}
        steps={steps}
        progressSteps={[1, 2]}
        onMove={vi.fn()}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'skip' })).toBeNull();
  });

  it('Next 버튼 클릭 시 다음 스텝으로 이동한다', async () => {
    vi.useFakeTimers();
    const onMove = vi.fn();

    render(
      <NewGoalFrame
        currStepIdx={0}
        steps={steps}
        progressSteps={[1, 2]}
        onMove={onMove}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));
    expect(onMove).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(onMove).toHaveBeenCalledWith(1);
  });

  it('마지막 스텝에서 Next 버튼 클릭 시 onComplete가 호출된다', () => {
    const onComplete = vi.fn();
    const onMove = vi.fn();

    render(
      <NewGoalFrame
        currStepIdx={1}
        steps={steps}
        progressSteps={[1, 2]}
        onMove={onMove}
        onSkip={vi.fn()}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(onComplete).toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
  });

  it('Prev 버튼 클릭 시 이전 스텝으로 이동한다', async () => {
    vi.useFakeTimers();
    const onMove = vi.fn();

    render(
      <NewGoalFrame
        currStepIdx={1}
        steps={steps}
        progressSteps={[1, 2]}
        onMove={onMove}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));
    expect(onMove).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(onMove).toHaveBeenCalledWith(0);
  });

  it('첫 스텝에서는 Prev 버튼이 비활성화된다', () => {
    const onMove = vi.fn();

    render(
      <NewGoalFrame
        currStepIdx={0}
        steps={steps}
        progressSteps={[1, 2]}
        onMove={onMove}
        onSkip={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const prevButton = screen.getByRole('button', { name: 'Previous Step' });
    expect(prevButton).toBeDisabled();
    fireEvent.click(prevButton);
    expect(onMove).not.toHaveBeenCalled();
  });
});
