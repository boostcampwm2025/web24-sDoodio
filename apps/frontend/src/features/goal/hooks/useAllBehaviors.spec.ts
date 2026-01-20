import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAllBehaviors } from './useAllBehaviors';
import { fetchAllBehaviors } from '../apis/fetchAllBehaviors.api';

vi.mock('../apis/fetchAllBehaviors.api', () => ({
  fetchAllBehaviors: vi.fn(),
}));

describe('useAllBehaviors Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enabled가 false(기본값)일 때는 데이터를 자동으로 불러오지 않아야 한다', () => {
    const { result } = renderHook(() => useAllBehaviors());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.allBehaviors).toBeUndefined();
    expect(fetchAllBehaviors).not.toHaveBeenCalled();
  });

  it('enabled가 true일 때는 자동으로 데이터를 불러와야 한다', async () => {
    const mockData = [
      { id: '1', title: '행동 1', difficulty: '마음열기', isCompleted: false },
      { id: '2', title: '행동 2', difficulty: '몰입하기', isCompleted: true },
    ];
    (fetchAllBehaviors as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useAllBehaviors(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allBehaviors).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(fetchAllBehaviors).toHaveBeenCalledTimes(1);
  });

  it('refetch 함수를 호출하면 데이터를 다시 불러와야 한다', async () => {
    const mockData = [{ id: '1', title: '새로운 행동' }];
    (fetchAllBehaviors as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useAllBehaviors(false));

    expect(fetchAllBehaviors).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.allBehaviors).toEqual(mockData);
    expect(fetchAllBehaviors).toHaveBeenCalledTimes(1);
  });

  it('API 호출 실패 시 에러 상태가 설정되어야 한다', async () => {
    const mockError = new Error('Failed to fetch all behaviors');
    (fetchAllBehaviors as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAllBehaviors(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allBehaviors).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });
});
