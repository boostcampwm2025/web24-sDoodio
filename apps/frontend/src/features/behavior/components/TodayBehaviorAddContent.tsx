import type { Behavior, GetGoalSummary } from '@web24/shared';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';

interface TodayBehaviorAddContentProps {
  goals: GetGoalSummary[];
  selectedGoal: GetGoalSummary | null;
  isLoadingBehaviors: boolean;
  goalBehaviors: Behavior[];
  onSelectGoal: (goalId: string) => void;
  onSelectBehavior: (behaviorId: string) => void;
}

export function TodayBehaviorAddContent({
  goals,
  selectedGoal,
  isLoadingBehaviors,
  goalBehaviors,
  onSelectGoal,
  onSelectBehavior,
}: TodayBehaviorAddContentProps) {
  if (!selectedGoal) {
    return (
      <div className="space-y-2">
        {goals.map((goal) => (
          <button
            key={goal.id}
            type="button"
            onClick={() => onSelectGoal(goal.id)}
            className="bg-bg-alternative hover:border-primary-strong flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 text-left transition"
          >
            <span className="text-label-normal text-sm font-semibold">{goal.title}</span>
            <span className="text-label-alternative text-xs">{goal.behaviorCount ?? 0}개</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-label-alternative mb-3 text-sm">{selectedGoal.title} 행동을 선택하세요</p>
      {isLoadingBehaviors && <p className="text-label-alternative text-sm">불러오는 중...</p>}
      {!isLoadingBehaviors && goalBehaviors.length === 0 && (
        <p className="text-label-alternative text-sm">등록된 행동이 없습니다.</p>
      )}
      {!isLoadingBehaviors && goalBehaviors.length > 0 && (
        <div className="space-y-2">
          {goalBehaviors.map((behavior) => (
            <button
              key={behavior.id}
              type="button"
              onClick={() => onSelectBehavior(behavior.id)}
              className="bg-bg-alternative hover:border-primary-strong flex w-full items-center justify-between gap-2 rounded-xl border border-transparent px-4 py-3 text-left transition"
            >
              <span className="text-label-normal text-sm font-semibold">{behavior.title}</span>
              <DifficultyBadge level={behavior.difficulty} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
