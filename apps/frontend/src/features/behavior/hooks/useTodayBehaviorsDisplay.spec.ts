import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { useTodayBehaviorsDisplay } from './useTodayBehaviorsDisplay';

// 모의 데이터
const mockBehaviors: Behavior[] = [
  {
    id: '1',
    title: '행동 1',
    difficulty: '마음열기',
    isChecked: false,
    goalTemplateId: 't1',
    goalColor: 'mint',
    goalTitle: '운동',
    isRecommended: false,
  },
  {
    id: '2',
    title: '행동 2',
    difficulty: '시작하기',
    isChecked: false,
    goalTemplateId: 't2',
    goalColor: 'mint',
    goalTitle: '운동',
    isRecommended: false,
  },
];

describe('useTodayBehaviorsDisplay', () => {
  const toggleMutation = { mutate: vi.fn() };
  const handleRewardInteraction = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 렌더링 시 서버 데이터를 정렬하여 displayBehaviors에 설정한다', () => {
    const { result } = renderHook(() =>
      useTodayBehaviorsDisplay({
        behaviors: mockBehaviors,
        toggleMutation,
        handleRewardInteraction,
      }),
    );

    expect(result.current.displayBehaviors).toHaveLength(2);
    expect(result.current.displayBehaviors[0].id).toBe('1');
  });

  it('handleBehaviorToggle 호출 시 UI 상태(isChecked)는 즉시 변경되어야 한다', () => {
    const { result } = renderHook(() =>
      useTodayBehaviorsDisplay({
        behaviors: mockBehaviors,
        toggleMutation,
        handleRewardInteraction,
      }),
    );

    act(() => {
      result.current.handleBehaviorToggle('1');
    });

    // 1. UI는 즉시 반영됨
    expect(result.current.displayBehaviors[0].isChecked).toBe(true);
    // 2. 하지만 mutate는 아직 호출되지 않음 (0.8초 대기)
    expect(toggleMutation.mutate).not.toHaveBeenCalled();
    // 3. 완료 상태가 되었으므로 인터랙션은 즉시 호출됨
    expect(handleRewardInteraction).toHaveBeenCalledWith('t1');
  });

  it('0.8초가 지나면 toggleMutation이 호출되고 리스트가 정렬되어야 한다', () => {
    const { result } = renderHook(() =>
      useTodayBehaviorsDisplay({
        behaviors: mockBehaviors,
        toggleMutation,
        handleRewardInteraction,
      }),
    );

    act(() => {
      result.current.handleBehaviorToggle('1');
    });

    // 시간을 0.8초 뒤로 돌림
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // 1. API 요청 발생
    expect(toggleMutation.mutate).toHaveBeenCalledWith({ id: '1', nextStatus: 'completed' });
    // 2. 정렬이 수행되어 체크된 항목이 뒤로 밀려남
    expect(result.current.displayBehaviors[0].id).toBe('2');
    expect(result.current.displayBehaviors[1].id).toBe('1');
  });

  it('토글이 아닌 일반적인 서버 데이터 변경(추가/삭제) 시에는 즉시 정렬을 반영해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ behaviors }) =>
        useTodayBehaviorsDisplay({
          behaviors,
          toggleMutation,
          handleRewardInteraction,
        }),
      { initialProps: { behaviors: mockBehaviors } },
    );

    // 삭제 발생 시뮬레이션
    const deletedBehaviors = [mockBehaviors[1]];
    rerender({ behaviors: deletedBehaviors });

    expect(result.current.displayBehaviors).toHaveLength(1);
    expect(result.current.displayBehaviors[0].id).toBe('2');
  });
});
