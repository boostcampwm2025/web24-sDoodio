import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Behavior, GetGoalSummary } from '@web24/shared';
import { fetchGoalBehaviors } from '@/features/goal/apis/fetchGoalBehaviors.api';
import { toast } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodayBehaviorAdd } from './useTodayBehaviorAdd';
import * as todayBehaviorApi from '../apis/createTodayBehavior.api';

vi.mock('@/features/goal/apis/fetchGoalBehaviors.api', () => ({
  fetchGoalBehaviors: vi.fn(),
}));

vi.mock('../apis/createTodayBehavior.api', () => ({
  createTodayBehavior: vi.fn(() => Promise.resolve({ id: 'b-1' })),
}));

vi.mock('react-toastify', () => ({
  toast: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useTodayBehaviorAdd', () => {
  const goals: GetGoalSummary[] = [
    {
      id: 'goal-1',
      title: '운동하기',
      color: 'pink',
      behaviorCount: 2,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'goal-2',
      title: '공부/자기계발',
      color: 'blue',
      behaviorCount: 1,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const goalBehaviors: Behavior[] = [
    { id: 'b-1', title: '스트레칭', difficulty: '시작하기' },
    { id: 'b-2', title: '걷기 10분', difficulty: '이어가기' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  it('초기 상태를 반환한다', () => {
    const { result } = renderHook(() => useTodayBehaviorAdd({ goals }), { wrapper });

    expect(result.current.isAddOpen).toBe(false);
    expect(result.current.selectedGoal).toBeNull();
    expect(result.current.goalBehaviors).toEqual([]);
    expect(result.current.isLoadingBehaviors).toBe(false);
  });

  it('모달을 열고 닫으면 상태와 스크롤이 갱신된다', async () => {
    const { result } = renderHook(() => useTodayBehaviorAdd({ goals }), { wrapper });

    act(() => {
      result.current.openAddModal();
    });

    await waitFor(() => {
      expect(result.current.isAddOpen).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    act(() => {
      result.current.closeAddModal();
    });

    await waitFor(() => {
      expect(result.current.isAddOpen).toBe(false);
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  it('목표를 선택하면 행동 목록을 불러온다', async () => {
    vi.mocked(fetchGoalBehaviors).mockResolvedValue(goalBehaviors);
    const { result } = renderHook(() => useTodayBehaviorAdd({ goals }), { wrapper });

    await act(async () => {
      await result.current.handleGoalSelect('goal-1');
    });

    await waitFor(() => {
      expect(result.current.isLoadingBehaviors).toBe(false);
    });

    expect(fetchGoalBehaviors).toHaveBeenCalledWith('goal-1');
    expect(result.current.selectedGoal?.id).toBe('goal-1');
    expect(result.current.goalBehaviors).toEqual(goalBehaviors);
  });

  it('목표 행동 로드 실패 시 토스트를 표시한다', async () => {
    vi.mocked(fetchGoalBehaviors).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useTodayBehaviorAdd({ goals }), { wrapper });

    await act(async () => {
      await result.current.handleGoalSelect('goal-1');
    });

    await waitFor(() => {
      expect(result.current.isLoadingBehaviors).toBe(false);
    });

    expect(toast).toHaveBeenCalledWith('행동 목록을 불러오지 못했어요.');
  });

  it('행동 추가 성공 시 모달을 닫는다', async () => {
    const { result } = renderHook(() => useTodayBehaviorAdd({ goals }), { wrapper });

    act(() => {
      result.current.openAddModal();
    });

    await act(async () => {
      result.current.handleBehaviorSelect('b-1');
    });

    expect(result.current.isAddOpen).toBe(false);
  });

  it('이미 추가된 행동이면 안내 토스트를 표시한다', async () => {
    vi.spyOn(todayBehaviorApi, 'createTodayBehavior').mockRejectedValue(
      new Error('Already exists'),
    );

    const { result } = renderHook(() => useTodayBehaviorAdd({ goals }), { wrapper });

    await act(async () => {
      result.current.handleBehaviorSelect('b-1');
    });

    expect(toast).toHaveBeenCalledWith('이미 존재합니다.');
  });
});
