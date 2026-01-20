import { useMemo, useState } from 'react';
import type { GetGoalSummary } from '@web24/shared';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';

export function useFilteredTodayBehaviors(goals: GetGoalSummary[], behaviors: Behavior[]) {
  const [activeGoal, setActiveGoal] = useState<string>('ALL');

  const goalTabs = useMemo(() => ['ALL', ...goals.map((goal) => goal.title)], [goals]);

  const filteredBehaviors = useMemo(() => {
    if (activeGoal === 'ALL') return behaviors;
    return behaviors.filter((behavior) => behavior.goalTitle === activeGoal);
  }, [behaviors, activeGoal]);

  return {
    activeGoal,
    setActiveGoal,
    goalTabs,
    filteredBehaviors,
  };
}
