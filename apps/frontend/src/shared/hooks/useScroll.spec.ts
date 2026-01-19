import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScroll } from './useScroll';

describe('useScroll', () => {
  afterEach(() => {
    // scrollY 초기화
    window.scrollY = 0;
    vi.restoreAllMocks();
  });

  it('초기 scrollY가 threshold보다 작으면 false 반환', () => {
    window.scrollY = 5;
    const { result } = renderHook(() => useScroll(10));
    expect(result.current).toBe(false);
  });

  it('scrollY가 threshold보다 크면 true 반환', () => {
    window.scrollY = 20;
    const { result } = renderHook(() => useScroll(10));
    expect(result.current).toBe(true);
  });

  it('스크롤 이벤트 발생 시 isScrolled 상태가 변경된다', () => {
    const { result } = renderHook(() => useScroll(10));

    // 초기값
    expect(result.current).toBe(false);

    act(() => {
      window.scrollY = 15;
      globalThis.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);

    act(() => {
      window.scrollY = 5;
      globalThis.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });

  it('threshold를 커스텀으로 지정할 수 있다', () => {
    window.scrollY = 50;
    const { result } = renderHook(() => useScroll(40));
    expect(result.current).toBe(true);

    const { result: result2 } = renderHook(() => useScroll(60));
    expect(result2.current).toBe(false);
  });
});
