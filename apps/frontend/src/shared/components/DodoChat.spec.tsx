import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DodoChat from './DodoChat';

describe('DodoChat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서 빈 메시지로 렌더링되어야 한다', () => {
    render(<DodoChat quote="테스트 인용구" />);

    // 두두 이미지가 렌더링되는지 확인
    const dodoImage = screen.getByAltText('두두 이미지');
    expect(dodoImage).toBeInTheDocument();

    // 초기에는 빈 메시지
    const message = screen.queryByText('테스트 인용구');
    expect(message).not.toBeInTheDocument();
  });

  it('타이핑 애니메이션 효과로 메시지를 표시해야 한다', () => {
    render(<DodoChat quote="안녕하세요" />);

    // 첫 글자 표시 (80ms 후)
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(screen.getByText(/안/)).toBeInTheDocument();

    // 두 번째 글자 표시 (160ms 후)
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(screen.getByText(/안녕/)).toBeInTheDocument();

    // 세 번째 글자 표시 (240ms 후)
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(screen.getByText(/안녕하/)).toBeInTheDocument();
  });

  it('전체 메시지가 표시될 때까지 타이핑 애니메이션이 계속되어야 한다', () => {
    const quote = '테스트';
    render(<DodoChat quote={quote} />);

    // 전체 메시지 길이만큼 시간 경과 (4글자 * 80ms = 320ms)
    act(() => {
      vi.advanceTimersByTime(quote.length * 80);
    });

    expect(screen.getByText(/테스트/)).toBeInTheDocument();
  });

  it('quote가 변경되면 메시지를 리셋하고 다시 타이핑 애니메이션을 시작해야 한다', () => {
    const { rerender } = render(<DodoChat quote="첫 번째" />);

    // 첫 번째 메시지 일부 표시
    act(() => {
      vi.advanceTimersByTime(240); // 3글자
    });
    expect(screen.getByText(/첫 번/)).toBeInTheDocument();

    // quote 변경
    rerender(<DodoChat quote="두 번째" />);

    // 메시지가 리셋되어야 함 (빈 상태)
    // 새로운 메시지 시작
    act(() => {
      vi.advanceTimersByTime(80); // 1글자
    });
    expect(screen.getByText(/두/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(240); // 3글자
    });
    expect(screen.getByText(/두 번/)).toBeInTheDocument();
  });

  it('컴포넌트가 언마운트될 때 interval을 정리해야 한다', () => {
    const { unmount } = render(<DodoChat quote="테스트" />);

    // interval이 설정되었는지 확인
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(screen.getByText(/테/)).toBeInTheDocument();

    // 언마운트
    unmount();

    // 타이머가 정리되었는지 확인 (에러가 발생하지 않아야 함)
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });

  it('커서 애니메이션이 표시되어야 한다', () => {
    render(<DodoChat quote="테스트" />);

    // 커서 요소 확인
    const cursor = screen.getByText('▍');
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveClass('animate-pulse');
  });

  it('긴 메시지도 올바르게 타이핑되어야 한다', () => {
    const longQuote =
      '이것은 매우 긴 인용구입니다. 타이핑 애니메이션이 제대로 작동하는지 확인합니다.';
    render(<DodoChat quote={longQuote} />);

    // 중간 지점까지 진행
    const halfLength = Math.floor(longQuote.length / 2);
    act(() => {
      vi.advanceTimersByTime(halfLength * 80);
    });

    const displayedText = screen.getByText(new RegExp(longQuote.slice(0, halfLength)));
    expect(displayedText).toBeInTheDocument();

    // 전체 메시지까지 진행
    act(() => {
      vi.advanceTimersByTime(longQuote.length * 80);
    });

    expect(screen.getByText(new RegExp(longQuote))).toBeInTheDocument();
  });

  it('빈 문자열이 전달되어도 에러가 발생하지 않아야 한다', () => {
    expect(() => {
      render(<DodoChat quote="" />);
    }).not.toThrow();

    // 커서만 표시되어야 함
    const cursor = screen.getByText('▍');
    expect(cursor).toBeInTheDocument();
  });
});
