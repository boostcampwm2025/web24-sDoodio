import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useDodoToastStore from '@/stores/useDodoToastStore';
import { useDodoToast } from './useDodoToast';

// useDodoToastStore 모킹
vi.mock('@/stores/useDodoToastStore', () => ({
  default: vi.fn(),
}));

describe('useDodoToast', () => {
  it('store에서 showToast 함수를 반환해야 한다', () => {
    const showToastMock = vi.fn();
    (useDodoToastStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showToast: showToastMock,
    });

    const { result } = renderHook(() => useDodoToast());

    // 래퍼 함수가 반환되므로 직접 비교 대신 호출 여부 확인
    result.current('테스트', { duration: 1000, position: 'top' });
    expect(showToastMock).toHaveBeenCalledWith('테스트', 1000, 'top');
  });
});
