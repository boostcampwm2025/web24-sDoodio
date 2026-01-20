import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Behavior } from '@web24/shared';
import { useGoalBehaviors } from './useGoalBehaviors';
import { fetchGoalBehaviors } from '../apis/fetchGoalBehaviors.api';

vi.mock('../apis/fetchGoalBehaviors.api');

describe('useGoalBehaviors', () => {
  const mockedFetch = vi.mocked(fetchGoalBehaviors);

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('초기 로딩 후 behaviors를 정상적으로 가져온다', async () => {
    const goalId = 'goal-1';
    const mockData: Behavior[] = [
      { id: 'b1', title: '물 1컵 마시기', difficulty: '마음열기' },
      { id: 'b2', title: '스트레칭 5분', difficulty: '시작하기' },
    ];

    mockedFetch.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useGoalBehaviors(goalId));

    // isLoading 초기 상태 확인
    expect(result.current.isLoading).toBe(true);
    expect(result.current.behaviors).toBeUndefined();
    expect(result.current.error).toBeNull();

    // behaviors 값이 변경될 때까지 기다리기
    await waitFor(() => expect(result.current.behaviors).toEqual(mockData));

    // 데이터 확인
    expect(result.current.behaviors).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetch 실패 시 error를 설정한다', async () => {
    const goalId = 'goal-1';
    mockedFetch.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useGoalBehaviors(goalId));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.behaviors).toBeUndefined();
    expect(result.current.error).toEqual(new Error('Network Error'));
  });

  it('enabled가 false면 자동 호출하지 않는다', () => {
    const goalId = 'goal-1';
    renderHook(() => useGoalBehaviors(goalId, false));

    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('refetch 호출 시 다시 데이터를 가져온다', async () => {
    const goalId = 'goal-1';
    const initialData: Behavior[] = [{ id: 'b1', title: '물 1컵 마시기', difficulty: '마음열기' }];

    mockedFetch.mockResolvedValueOnce(initialData);

    const { result } = renderHook(() => useGoalBehaviors(goalId));

    await waitFor(() => expect(result.current.behaviors).toEqual(initialData));

    // refetch용 새로운 데이터
    const newData: Behavior[] = [{ id: 'b2', title: '스트레칭 5분', difficulty: '시작하기' }];
    mockedFetch.mockResolvedValueOnce(newData);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.behaviors).toEqual(newData);
  });
});
