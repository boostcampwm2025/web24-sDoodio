import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DodoToast from './Toast';

describe('DodoToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('메시지를 렌더링해야 한다', () => {
    render(<DodoToast message="테스트 메시지" duration={3000} onClose={vi.fn()} />);
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('지정된 시간이 지나면 onClose가 호출되어야 한다', () => {
    const onClose = vi.fn();
    render(<DodoToast message="테스트 메시지" duration={3000} onClose={onClose} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('메시지가 변경되면 타이머가 리셋되어야 한다', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <DodoToast message="첫 번째 메시지" duration={3000} onClose={onClose} />,
    );

    // 2초 경과
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 아직 닫히지 않아야 함
    expect(onClose).not.toHaveBeenCalled();

    // 메시지 변경 (타이머 리셋)
    rerender(<DodoToast message="두 번째 메시지" duration={3000} onClose={onClose} />);

    // 추가 2초 경과 (총 4초 경과, 하지만 리셋되었으므로 2초 경과 시점)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // 여전히 닫히지 않아야 함 (새 타이머 기준 2초 경과)
    expect(onClose).not.toHaveBeenCalled();

    // 1초 더 경과 (새 타이머 기준 3초 경과)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 이제 닫혀야 함
    expect(onClose).toHaveBeenCalled();
  });
});
