import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAIBehaviors } from './useAIBehaviors';
import { fetchAIBehaviors } from '../apis/fetchAIBehaviors.api';
import { createAIBehaviors } from '../apis/createAIBehaviors.api';

vi.mock('../apis/fetchAIBehaviors.api', () => ({
  fetchAIBehaviors: vi.fn(),
}));

vi.mock('../apis/createAIBehaviors.api', () => ({
  createAIBehaviors: vi.fn(),
}));

describe('useAIBehaviors', () => {
  const mockBehaviors = [
    {
      id: '1',
      title: 'Behavior 1',
      goalTitle: 'Goal 1',
      goalColor: 'mint',
      isChecked: false,
      difficulty: '몰입하기',
      isRecommended: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태를 올바르게 반환한다', () => {
    vi.mocked(fetchAIBehaviors).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAIBehaviors());

    expect(result.current.behaviors).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isMaking).toBe(false);
    expect(result.current.isError).toBe(null);
  });

  it('데이터 페칭이 성공하면 행동 리스트를 업데이트한다', async () => {
    vi.mocked(fetchAIBehaviors).mockResolvedValue(mockBehaviors as any);

    const { result } = renderHook(() => useAIBehaviors());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.behaviors).toEqual(mockBehaviors);
    expect(result.current.isMaking).toBe(false);
  });

  it('기존 추천 행동이 없으면 새로운 행동을 생성한다', async () => {
    vi.mocked(fetchAIBehaviors).mockResolvedValue([]);
    vi.mocked(createAIBehaviors).mockResolvedValue(mockBehaviors as any);

    const { result } = renderHook(() => useAIBehaviors());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(createAIBehaviors).toHaveBeenCalled();
    expect(result.current.behaviors).toEqual(mockBehaviors);
    expect(result.current.isMaking).toBe(false);
  });

  it('페칭 중 에러가 발생하면 에러 상태를 업데이트한다', async () => {
    const error = new Error('Fetch failed');
    vi.mocked(fetchAIBehaviors).mockRejectedValue(error);

    const { result } = renderHook(() => useAIBehaviors());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toEqual(error);
  });
});
