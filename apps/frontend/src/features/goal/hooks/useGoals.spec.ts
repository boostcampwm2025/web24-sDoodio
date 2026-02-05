import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGoals } from './useGoals';
import { fetchGoals } from '../apis/fetchGoals.api';

vi.mock('../apis/fetchGoals.api', () => ({
  fetchGoals: vi.fn(),
}));

describe('useGoals Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 렌더링 시 로딩 상태여야 한다', async () => {
    (fetchGoals as any).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useGoals());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.goals).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('데이터를 성공적으로 불러오면 goals에 데이터가 담기고 로딩이 끝나야 한다', async () => {
    const mockData = {
      goals: [
        { id: '1', title: 'Goal 1', color: 'green' },
        { id: '2', title: 'Goal 2', color: 'blue' },
      ],
    };

    (fetchGoals as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.goals).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('API 호출 실패 시 에러 상태가 설정되어야 한다', async () => {
    const mockError = new Error('Network Error');
    (fetchGoals as any).mockRejectedValue(mockError);

    const { result } = renderHook(() => useGoals());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.goals).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });
});
