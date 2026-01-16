import { useMemo, useState } from 'react';
import { BEHAVIOR_DIFFICULTIES, type Behavior, type BehaviorDifficulty } from '@web24/shared';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';
import { useGoalBehaviors } from '../hooks/useGoalBehaviors';

type DifficultyFilter = 'ALL' | BehaviorDifficulty;
const VISIBLE_DIFFICULTIES = BEHAVIOR_DIFFICULTIES.filter((difficulty) => difficulty !== 'AI');

interface GoalBehaviorListProps {
  goalId: string;
}

export function GoalBehaviorList({ goalId }: GoalBehaviorListProps) {
  const { behaviors, isLoading, error } = useGoalBehaviors(goalId, Boolean(goalId));
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('ALL');

  const difficultyCounts = useMemo(() => {
    const base = BEHAVIOR_DIFFICULTIES.reduce(
      (acc, difficulty) => {
        acc[difficulty] = 0;
        return acc;
      },
      {} as Record<BehaviorDifficulty, number>,
    );

    (behaviors ?? []).forEach((behavior) => {
      base[behavior.difficulty] += 1;
    });

    return base;
  }, [behaviors]);

  const filteredBehaviors = useMemo(() => {
    if (!behaviors) return [];
    if (activeFilter === 'ALL') return behaviors;
    return behaviors.filter((behavior) => behavior.difficulty === activeFilter);
  }, [behaviors, activeFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`bg-primary-strong text-bg-light rounded-full border px-3 py-1 text-[12px] font-bold transition ${
            activeFilter === 'ALL'
              ? 'border-primary-strong opacity-100'
              : 'border-primary-weak opacity-60 hover:opacity-100'
          }`}
          onClick={() => setActiveFilter('ALL')}
        >
          전체 {behaviors?.length ?? 0}
        </button>
        {VISIBLE_DIFFICULTIES.map((difficulty) => (
          <DifficultyBadge
            key={difficulty}
            level={difficulty}
            count={difficultyCounts[difficulty]}
            selected={activeFilter === difficulty}
            onClick={() => setActiveFilter(difficulty)}
            className="px-3 py-1 text-[12px]"
          />
        ))}
      </div>

      {isLoading && <p className="text-label-disable text-sm">행동을 불러오는 중...</p>}
      {!isLoading && error && (
        <p className="text-sm text-red-600">행동을 불러오는 데 실패했습니다.</p>
      )}

      <div className="bg-primary-weak/30 scrollbar-pretty max-h-[60vh] min-h-[45vh] flex-1 overflow-y-auto rounded-2xl p-6">
        {!isLoading && !error && filteredBehaviors.length === 0 && (
          <p className="text-label-disable text-sm">등록된 행동이 없습니다.</p>
        )}
        <div className="flex flex-col gap-3">
          {filteredBehaviors.map((behavior: Behavior) => (
            <div
              key={behavior.id}
              className="bg-bg-light flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-sm"
            >
              <p className="text-headline-2 font-semibold">{behavior.title}</p>
              <DifficultyBadge level={behavior.difficulty} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
