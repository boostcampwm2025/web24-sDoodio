import { useEffect, useState } from 'react';
import type { AllBehaviorStatItem, GoalBehaviorStat } from '@web24/shared';
import { fetchTopBehaviors } from '@/features/stat/apis/fetchTopBehaviors.api';
import { fetchTotalCompletedCount } from '@/features/stat/apis/fetchTotalCompletedCount.api';
import { AccumulatedBehaviorStats } from '@/features/stat/components/AccumulatedBehaviorStats';
import { DifficultyGraph } from '@/features/stats/components/DifficultyGraph';
import { StatInsightsGrid } from '@/features/stats/components/StatInsightsGrid';
import { Info } from 'lucide-react';
import { ICON_SIZE } from '@/shared/constants/icon';

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

export function StatsPage() {
  const [allTopBehaviors, setAllTopBehaviors] = useState<AllBehaviorStatItem>({
    totalCount: 0,
    items: [],
  });
  const [goalTopBehaviors, setGoalTopBehaviors] = useState<GoalBehaviorStat[]>([]);
  const [totalCompletedCount, setTotalCompletedCount] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);

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
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 md:pt-2">
      {/* 총 횟수 */}
      <section>
        <h2 className="text-headline-1 flex items-center gap-2 font-semibold">
          지금까지 행동을 총{' '}
          <span className="text-primary-strong text-3xl font-bold">{totalCompletedCount}</span>번
          해냈어요!
          <span className="group relative inline-flex">
            <button
              type="button"
              aria-label="통계 집계 기준 안내"
              aria-describedby="stats-summary-tooltip"
              aria-expanded={showTooltip}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip((prev) => !prev)}
            >
              <Info size={ICON_SIZE.xxs} />
            </button>
            <span
              id="stats-summary-tooltip"
              role="tooltip"
              className={`bg-bg-light text-label-normal border-bg-alternative pointer-events-none absolute top-full right-0 z-20 mt-2 w-max max-w-[70vw] rounded-xl border px-3 py-2 text-xs font-medium break-words whitespace-normal shadow-(--shadow-normal) transition-opacity duration-200 ${showTooltip ? 'visible opacity-100' : 'invisible opacity-0'}`}
            >
              모든 통계는 어제까지의 기록이 집계됩니다
            </span>
          </span>
        </h2>
      </section>

      {/* 누적 행동 통계 */}
      <StatsContainer title="지금까지 가장 많이한 행동이에요">
        <AccumulatedBehaviorStats
          allTopBehaviors={allTopBehaviors}
          goalTopBehaviors={goalTopBehaviors}
        />
      </StatsContainer>

      {/* 난이도 통계 */}
      <StatsContainer title="요즘 이런 흐름으로 행동했어요">
        <DifficultyGraph />
      </StatsContainer>
      {/* 랜덤 통계 */}
      <StatsContainer title="이런 점이 눈에 띄었어요">
        <StatInsightsGrid />
      </StatsContainer>
    </div>
  );
}
