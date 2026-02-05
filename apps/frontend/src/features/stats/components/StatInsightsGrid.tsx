import { useEffect, useMemo, useState } from 'react';
import type { GetStatInsightsResponse } from '@web24/shared';
import seedrandom from 'seedrandom';
import { fetchStatInsights } from '../apis/fetchStatInsights.api';
import { AvgCompletedCard } from './AvgCompletedCard';
import { CompletionTimeCard } from './CompletionTimeCard';
import { DailyDifficultyCard } from './DailyDifficultyCard';
import { GoalBehaviorCountCard } from './GoalBehaviorCountCard';
import { NotDoneCountsCard } from './NotDoneCountsCard';
import { OriginCompletedCard } from './OriginCompletedCard';
import { TotalDifficultyCard } from './TotalDifficultyCard';
import { WeeklyDifficultyCard } from './WeeklyDifficultyCard';

type StatInsightCard = {
  id: string;
  render: (insights: GetStatInsightsResponse) => React.ReactNode;
};

const CARD_COUNT = 4;

const getTimeSeed = (date = new Date(), hourBlockSize = 1) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  const hourBlock = Math.floor(date.getHours() / hourBlockSize);
  // hourBlockSize = 1 → 15~16
  // hourBlockSize = 2 → 14~16

  return `${y}-${m}-${d}-${hourBlock}`;
};

const pickRandomCards = (cards: StatInsightCard[], count: number, date = new Date()) => {
  const seed = getTimeSeed(date);
  const rng = seedrandom(seed);

  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

const buildCandidates = (): StatInsightCard[] => [
  {
    id: 'originCompletedCounts',
    render: (insights) => <OriginCompletedCard counts={insights.originCompletedCounts} />,
  },
  {
    id: 'avgCompletedPerDay',
    render: (insights) => <AvgCompletedCard value={insights.avgCompletedPerDay} />,
  },
  {
    id: 'dailyDifficultyCompletedCounts',
    render: (insights) => <DailyDifficultyCard counts={insights.dailyDifficultyCompletedCounts} />,
  },
  {
    id: 'weeklyDifficultyCompletedCounts',
    render: (insights) => (
      <WeeklyDifficultyCard counts={insights.weeklyDifficultyCompletedCounts} />
    ),
  },
  {
    id: 'totalDifficultyCompletedCounts',
    render: (insights) => <TotalDifficultyCard counts={insights.totalDifficultyCompletedCounts} />,
  },
  {
    id: 'completionTimeBuckets',
    render: (insights) => <CompletionTimeCard buckets={insights.completionTimeBuckets} />,
  },
  {
    id: 'goalBehaviorDegree',
    render: (insights) => (
      <GoalBehaviorCountCard
        goalDegree={insights.goalCountDegree}
        behaviorDegree={insights.behaviorCountDegree}
      />
    ),
  },
  {
    id: 'notDoneCounts',
    render: (insights) => <NotDoneCountsCard counts={insights.notDoneCounts} />,
  },

  // TODO: 수집되지 않는 데이터를 사용하는 랜덤 카드들 - 백엔드 작업 필요
  // {
  //   id: 'checkInTotal',
  //   render: (insights) => <CheckInTotalCard count={insights.checkInTotal} />,
  // },
  // {
  //   id: 'duduCatchTotal',
  //   render: (insights) => <DuduCatchTotalCard count={insights.duduCatchTotal} />,
  // },
  // {
  //   id: 'avgRefreshPerDay',
  //   render: (insights) => <AvgRefreshCard value={insights.avgRefreshPerDay} />,
  // },
];

export function StatInsightsGrid() {
  const [insights, setInsights] = useState<GetStatInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchStatInsights()
      .then((data) => {
        setInsights(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to fetch stat insights'));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const cards = useMemo(() => {
    if (!insights) return [];
    const candidates = buildCandidates();
    return pickRandomCards(candidates, CARD_COUNT);
  }, [insights]);

  if (isLoading) {
    return <div className="text-label-disable flex h-40 items-center">데이터를 불러오는 중...</div>;
  }

  if (error || cards.length === 0) {
    return (
      <div className="text-label-disable flex h-40 items-center">
        조금 더 쌓이면 보여줄 수 있어요.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {cards.map((card) => (
        <div key={card.id}>{card.render(insights as GetStatInsightsResponse)}</div>
      ))}
    </div>
  );
}
