import { useCallback, useEffect, useMemo, useState } from 'react';
import { BREAKPOINTS } from '@/shared/constants/breakpoints';
import type { Behavior } from '@web24/shared';
import { ChevronsDown, ChevronsUp, Plus } from 'lucide-react';
import { ICON_SIZE } from '@/shared/constants/icon';
import { useNavigate } from 'react-router-dom';
import { GoalCard } from '@/features/goal/components/GoalCard';
import { useAllBehaviors } from '@/features/goal/hooks/useAllBehaviors';
import { useGoals } from '@/features/goal/hooks/useGoals';

export function AllGoalsPage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState(1);
  const { goals, isLoading: isGoalsLoading } = useGoals();

  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const { allBehaviors, isLoading: isBehaviorsLoading } = useAllBehaviors(isAllExpanded);
  const behaviorsByGoal = useMemo(
    () =>
      allBehaviors?.reduce(
        (acc, behavior) => {
          const { goalId } = behavior as any;
          if (goalId) {
            if (!acc[goalId]) acc[goalId] = [];
            acc[goalId].push(behavior);
          }
          return acc;
        },
        {} as Record<string, Behavior[]>,
      ),
    [allBehaviors],
  );

  // 화면 크기에 따른 열 개수 계산
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= BREAKPOINTS.DESKTOP) {
        setColumns(3);
      } else if (window.innerWidth >= BREAKPOINTS.TABLET) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setIsAllExpanded(false);
      setExpandedGoalIds(new Set());
    } else {
      setIsAllExpanded(true);
      if (goals) {
        setExpandedGoalIds(new Set(goals.map((g) => g.id)));
      }
    }
  };

  const handleToggleGoal = useCallback((id: string) => {
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setIsAllExpanded(false);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (isGoalsLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <p className="text-label-assistive">목표를 불러오고 있어요...</p>
      </div>
    );
  }

  const totalGoals = goals?.length;

  const distributedGoals = Array.from({ length: columns }, (_, i) =>
    goals?.filter((_value, index) => index % columns === i),
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* 페이지 헤더 */}
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-label-normal text-title-1 flex items-center gap-2 font-bold">
            전체 목표
          </h1>
          <p className="text-label-disable mt-1 text-sm font-medium">
            총 <span className="text-primary-strong text-lg font-bold">{totalGoals}</span> 개의
            목표를 관리하고 있어요
          </p>
        </div>

        <div className="flex flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={toggleExpandAll}
            disabled={isBehaviorsLoading}
            className="flex flex-row items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {isAllExpanded ? (
              <>
                <ChevronsUp size={ICON_SIZE.sm} />
                <span>전부 접기</span>
              </>
            ) : (
              <>
                <ChevronsDown size={ICON_SIZE.sm} />
                <span>전부 펼치기</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/goals/new')}
            className="bg-primary text-bg-base hover:bg-primary/90 flex flex-row items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Plus size={ICON_SIZE.sm} />
            <span>목표 추가</span>
          </button>
        </div>
      </header>

      {/* 목표 카드 리스트 */}
      <div className="flex items-start gap-6">
        {distributedGoals.map((goalsInColumn) => (
          <div
            key={goalsInColumn?.map((v) => v.id).join('-')}
            className="flex w-full min-w-0 flex-1 flex-col gap-6"
          >
            {goalsInColumn?.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                behaviors={behaviorsByGoal?.[goal.id]}
                isOpen={expandedGoalIds.has(goal.id)}
                onToggle={() => handleToggleGoal(goal.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
