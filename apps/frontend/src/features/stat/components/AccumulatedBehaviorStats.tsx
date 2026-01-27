import { useState, useMemo } from 'react';
import { ResponsivePie, type DatumId, type PieTooltipProps } from '@nivo/pie';
import type { AllBehaviorStatItem, BehaviorStatItem, GoalBehaviorStat } from '@web24/shared';
import { SwiperTabs } from '@/features/behavior/components/SwiperTabs';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';

interface Datum {
  id: string;
  label: string;
  value: number;
  color: string;
}

function PieTooltip({ datum }: PieTooltipProps<Datum>) {
  return (
    <div className="bg-bg-light border-primary-strong text-label-alternative rounded-sm border p-1 text-sm">
      {datum.value}
    </div>
  );
}

interface AccumulatedBehaviorStatsProps {
  allTopBehaviors: AllBehaviorStatItem;
  goalTopBehaviors: GoalBehaviorStat[];
}

export function AccumulatedBehaviorStats({
  allTopBehaviors,
  goalTopBehaviors,
}: AccumulatedBehaviorStatsProps) {
  const [activeGoal, setActiveGoal] = useState<string>('ALL');
  const [activeId, setActiveId] = useState<DatumId | null>(null);

  // 서버에서 TOP10 내림차순 정렬된 데이터를 받는다고 가정
  const currentData = useMemo(() => {
    if (activeGoal === 'ALL') {
      return allTopBehaviors;
    }

    const goalStat = goalTopBehaviors.find((b) => b.id === activeGoal);
    if (!goalStat) return { totalCount: 0, items: [] };

    const enrichedItems: BehaviorStatItem[] = goalStat.items.map((item) => ({
      ...item,
      goalTitle: goalStat.goalTitle,
      goalColor: goalStat.goalColor,
    }));

    return {
      totalCount: goalStat.totalCount,
      items: enrichedItems,
    };
  }, [activeGoal, allTopBehaviors, goalTopBehaviors]);

  const chartData = currentData.items.map((item) => ({
    id: item.id,
    label: item.behaviorTitle,
    value: item.count,
    color: `var(--color-goal-${item.goalColor})`,
  }));

  const hasData = currentData.items.length > 0;

  const goalTabs = [
    { label: 'ALL', value: 'ALL' },
    ...goalTopBehaviors.map((b) => ({
      label: b.goalTitle,
      value: b.id,
    })),
  ];

  if (!hasData) {
    return (
      <div className="text-label-disable flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-body-1 font-semibold">조금 더 쌓이면 보여줄 수 있어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex-1 overflow-hidden">
        <SwiperTabs tabs={goalTabs} onChange={setActiveGoal} />
      </div>
      <div className="flex flex-col items-start gap-4 md:flex-row">
        <div className="min-h-85 w-full p-2 md:min-h-100 md:w-1/2">
          <ResponsivePie
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            sortByValue
            arcLabel="label"
            arcLabelsTextColor="#252322"
            enableArcLinkLabels={false}
            activeOuterRadiusOffset={8}
            // colors={(item) => item.data.color}
            tooltip={PieTooltip}
            activeId={activeId}
            onMouseEnter={(datum) => setActiveId(datum.id)}
            onMouseLeave={() => setActiveId(null)}
          />
        </div>
        <div className="flex h-fit w-full flex-col gap-1 p-2 md:w-1/2">
          {currentData.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setActiveId(item.id)}
              onMouseLeave={() => setActiveId(null)}
              className={`flex cursor-default items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                activeId === item.id
                  ? 'border-bg-alternative scale-[1.02] bg-gray-50 shadow-sm'
                  : 'bg-bg-light hover:bg-bg-alternative border-bg-alternative'
              }`}
            >
              {/* 리스트카드 왼쪽 */}
              <div className="min-w-0">
                <div
                  className={`flex h-9 flex-col ${
                    activeGoal === 'ALL' ? 'justify-between' : 'justify-center'
                  }`}
                >
                  {activeGoal === 'ALL' && (
                    <p className="text-label-disable mr-auto truncate text-[10px] font-medium">
                      {item.goalTitle}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <p className="text-label-normal truncate text-sm font-bold">
                      {item.behaviorTitle}
                    </p>
                    <DifficultyBadge level={item.behaviorDifficulty} />
                  </div>
                </div>
              </div>

              {/* 리스트카드 오른쪽 */}
              <div className="shrink-0 text-right">
                <span className="text-label-normal block text-sm font-bold">{item.count}회</span>
                <span className="text-[10px] text-gray-400">
                  {Math.round((item.count / currentData.totalCount) * 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
