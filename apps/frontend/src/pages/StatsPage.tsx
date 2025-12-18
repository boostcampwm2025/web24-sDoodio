import { useEffect, useState } from 'react';
import type { StatsResponse } from '@web24/shared';
import { StatsResponseSchema } from '@web24/shared';
import {
  FavoriteCategoryPieCard,
  type CategoryStat,
} from '@/features/stat/components/FavoriteCategoryPieCard';
import { statsResponseMock } from '@/__mocks__/statsResponse.mock';
import { StatsPeriodHeader } from '@/features/stat/components/StatsPeriodHeader';
import { DdwuelMessageCard } from '@/features/stat/components/DdwuelMessageCard';
import { TotalCountCard } from '@/features/stat/components/TotalCountCard';
import { DdwuelInsightsCard } from '@/features/stat/components/DdwuelInsightsCard';

async function fetchStats(_period: { year: number; month: number }): Promise<StatsResponse> {
  // TODO: 실제 API 연동 시 fetch(`/api/stats?period=${year}-${month}`)로 대체
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 200);
  });
  return { ...statsResponseMock, period: _period };
}

export function StatsPage() {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: StatsResponse }
  >({ status: 'loading' });

  useEffect(() => {
    let canceled = false;
    const period = { year: 2025, month: 12 };

    (async () => {
      try {
        const response = await fetchStats(period);
        const parsed = StatsResponseSchema.parse(response);
        if (canceled) return;
        setState({ status: 'success', data: parsed });
      } catch (e) {
        if (canceled) return;
        const message = e instanceof Error ? e.message : '통계를 불러오지 못했어요.';
        setState({ status: 'error', message });
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const isLoading = state.status !== 'success';
  const data = state.status === 'success' ? state.data : null;

  const categories: CategoryStat[] = data
    ? data.categories.map((c) => ({ name: c.categoryName, count: c.count, color: c.color }))
    : [];
  const topCategory = categories.slice().sort((a, b) => b.count - a.count)[0];

  const trendLabel = (() => {
    if (!data) return undefined;
    const change = data.totals.monthCount - data.totals.prevMonthCount;
    if (change === 0) return '지난달과 비슷한 속도로 몽글몽글 쌓이고 있어요.';
    if (change > 0) return '지난달보다 조금 더 자주 시작했어요. 빈칸이 없어도 충분해요.';
    return '지난달보다 느슨해졌지만 괜찮아요. 쌓인 기록은 사라지지 않아요.';
  })();

  return (
    <div className="space-y-6">
      <StatsPeriodHeader isLoading={isLoading} period={data?.period ?? null} />

      {state.status === 'error' && (
        <section className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-700 shadow-sm">
          통계를 불러오지 못했어요. ({state.message})
        </section>
      )}

      <DdwuelMessageCard
        isLoading={isLoading}
        topCategoryName={topCategory?.name ?? ''}
        trendLabel={trendLabel ?? ''}
      />

      <TotalCountCard count={data?.totals.allTimeCount ?? null} isLoading={isLoading} />

      <section className="grid gap-4">
        {data && <FavoriteCategoryPieCard categories={categories} />}

        <DdwuelInsightsCard insights={data?.insights ?? null} isLoading={isLoading} />
      </section>
    </div>
  );
}
