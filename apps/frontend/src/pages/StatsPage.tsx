import { DifficultyGraph } from '@/features/stats/components/DifficultyGraph';
import { SwiperTabs } from '@/features/behavior/components/SwiperTabs';
import { fetchTopBehaviors } from '@/features/stat/apis/fetchTopBehaviors.api';
import { fetchTotalCompletedCount } from '@/features/stat/apis/fetchTotalCompletedCount.api';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';
import { ResponsivePie, type DatumId, type PieTooltipProps } from '@nivo/pie';
import type { AllBehaviorStatItem, BehaviorStatItem, GoalBehaviorStat } from '@web24/shared';
import { useEffect, useMemo, useState } from 'react';

interface StatsContainerProps {
  title: string;
  children: React.ReactNode;
}

function StatsContainer({ title, children }: StatsContainerProps) {
  return (
    <section className="border-primary-weak/60 bg-bg-light/80 flex flex-col gap-3 rounded-3xl border p-5">
      <h2 className="text-heading-2 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

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

export function StatsPage() {
  const [activeGoal, setActiveGoal] = useState<string>('ALL');
  const [activeId, setActiveId] = useState<DatumId | null>(null);
  const [allTopBehaviors, setAllTopBehaviors] = useState<AllBehaviorStatItem>({
    totalCount: 0,
    items: [],
  });
  const [goalTopBehaviors, setGoalTopBehaviors] = useState<GoalBehaviorStat[]>([]);
  const [totalCompletedCount, setTotalCompletedCount] = useState<number>(0);

  useEffect(() => {
    fetchTopBehaviors().then((data) => {
      setAllTopBehaviors(data.all);
      setGoalTopBehaviors(data.goals);
    });
  }, []);
  useEffect(() => {
    fetchTotalCompletedCount().then((data) => {
      setTotalCompletedCount(data.count);
    });
  }, []);

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

  const goalTabs = [
    { label: 'ALL', value: 'ALL' },
    ...goalTopBehaviors.map((b) => ({
      label: b.goalTitle,
      value: b.id,
    })),
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 md:pt-2">
      {/* 총 횟수 */}
      <section>
        <h2 className="text-headline-1 font-semibold">
          지금까지 행동을 총{' '}
          <span className="text-primary-strong text-3xl font-bold">{totalCompletedCount}</span>번
          해냈어요!
        </h2>
      </section>
      {/* 누적 행동 통계 */}
      <StatsContainer title="지금까지 가장 많이한 행동이에요">
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
      </StatsContainer>
      {/* 난이도 통계 */}
      <StatsContainer title="요즘 이런 흐름으로 행동했어요">
        <DifficultyGraph />
      </StatsContainer>
      {/* 랜덤 통계 */}
      <StatsContainer title="이런 점이 눈에 띄었어요">
        {/* 데스크톱: 2x2 카드, 모바일: 일렬 카드배치 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border">카드1</div>
          <div className="border">카드2</div>
          <div className="border">카드3</div>
          <div className="border">카드4</div>
        </div>
      </StatsContainer>
    </div>
  );
}
