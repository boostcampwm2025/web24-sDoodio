import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { GetGoalSummary } from '@web24/shared';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { useFilteredTodayBehaviors } from './useFilteredTodayBehaviors';

describe('useFilteredTodayBehaviors', () => {
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

  const behaviors: Behavior[] = [
    {
      id: 'b-1',
      title: '스트레칭',
      goalTitle: '운동하기',
      goalColor: 'pink',
      isChecked: false,
      difficulty: '시작하기',
      isRecommended: false,
    },
    {
      id: 'b-2',
      title: '책 한 페이지 넘기기',
      goalTitle: '공부/자기계발',
      goalColor: 'blue',
      isChecked: false,
      difficulty: '시작하기',
      isRecommended: false,
    },
  ];

  it('기본 상태에서 전체 행동과 탭을 반환한다', () => {
    const { result } = renderHook(() => useFilteredTodayBehaviors(goals, behaviors));

    expect(result.current.activeGoal).toBe('ALL');
    expect(result.current.goalTabs).toEqual(['ALL', '운동하기', '공부/자기계발']);
    expect(result.current.filteredBehaviors).toEqual(behaviors);
  });

  it('선택한 목표로 행동이 필터링된다', () => {
    const { result } = renderHook(() => useFilteredTodayBehaviors(goals, behaviors));

    act(() => {
      result.current.setActiveGoal('운동하기');
    });

    expect(result.current.filteredBehaviors).toEqual([behaviors[0]]);
  });
});
