import type { StatsResponse } from '@web24/shared';
import { CalendarDays, CloudRain, Clock3, Users } from 'lucide-react';
import type { ReactNode } from 'react';

type Insights = StatsResponse['insights'];

function ChipSkeleton() {
  return <span className="h-7 w-20 animate-pulse rounded-full bg-white shadow-sm" />;
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
      {label}
    </span>
  );
}

function TitleSkeleton({ widthClassName }: { widthClassName: string }) {
  return (
    <span className={`inline-block h-7 animate-pulse rounded bg-gray-200 ${widthClassName}`} />
  );
}

function ChipRow({ isLoading, labels }: { isLoading: boolean; labels: string[] }) {
  if (isLoading) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {[0, 1, 2].map((i) => (
          <ChipSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {labels.map((label) => (
        <Chip key={label} label={label} />
      ))}
    </div>
  );
}

function InsightPanel({
  icon,
  title,
  headline,
  headlineSkeletonWidthClassName,
  description,
  chips,
  isLoading,
}: {
  icon: ReactNode;
  title: string;
  headline: string;
  headlineSkeletonWidthClassName: string;
  description: string;
  chips: string[];
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        {icon}
        {title}
      </div>

      <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
        {isLoading ? <TitleSkeleton widthClassName={headlineSkeletonWidthClassName} /> : headline}
      </p>

      <p className="mt-1 text-sm text-gray-600">{description}</p>

      <ChipRow isLoading={isLoading} labels={chips} />
    </div>
  );
}

export function DdwuelInsightsCard({
  insights,
  isLoading,
}: {
  insights: Insights | null;
  isLoading: boolean;
}) {
  const bestWeekdayHeadline = insights ? `${insights.bestWeekday.weekday}요일이 특히 편해요` : '';
  const bestTimeHeadline = insights ? `${insights.bestTime.timeBucket}에 더 잘 돼요` : '';
  const weatherHeadline = insights ? `${insights.weatherHint.weather}인 날에 더 잘 돼요` : '';
  const focusHeadline = insights
    ? `이번 달은 ${insights.focusVsOthers.itemName}에 더 마음이 갔어요`
    : '';

  const bestWeekdayChips = insights ? insights.bestWeekday.actions.map((a) => a.title) : [];
  const bestTimeChips = insights ? insights.bestTime.actions.map((a) => a.title) : [];
  const weatherChips = insights ? insights.weatherHint.actions.map((a) => a.title) : [];
  const focusChips = insights ? insights.focusVsOthers.actions.map((a) => a.title) : [];

  const weatherDescription =
    insights?.weatherHint.message ?? '날씨는 바꿀 수 없지만, “되는 조건”은 가져올 수 있어요.';

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-800">뚜웰 인사이트</h3>
          <p className="text-xs text-gray-500">“언제/어떤 순간에 더 잘 되는지”를 찾아요.</p>
        </div>
      </header>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InsightPanel
          chips={bestWeekdayChips}
          description="바쁜 요일 대신 “되는 날”을 잡아두면 쉬워져요."
          headline={bestWeekdayHeadline}
          headlineSkeletonWidthClassName="w-44"
          icon={<CalendarDays aria-hidden size={16} />}
          isLoading={isLoading}
          title="잘 되는 요일"
        />

        <InsightPanel
          chips={bestTimeChips}
          description="완벽한 계획보다, 되는 시간에 얹어두기."
          headline={bestTimeHeadline}
          headlineSkeletonWidthClassName="w-56"
          icon={<Clock3 aria-hidden size={16} />}
          isLoading={isLoading}
          title="잘 되는 시간대"
        />

        <InsightPanel
          chips={weatherChips}
          description={weatherDescription}
          headline={weatherHeadline}
          headlineSkeletonWidthClassName="w-44"
          icon={<CloudRain aria-hidden size={16} />}
          isLoading={isLoading}
          title="날씨 힌트"
        />

        <InsightPanel
          chips={focusChips}
          description="나에게 맞는 방향이 보이면, 나머지는 자연스럽게 따라와요."
          headline={focusHeadline}
          headlineSkeletonWidthClassName="w-56"
          icon={<Users aria-hidden size={16} />}
          isLoading={isLoading}
          title="남들보다 내가 더 집중한"
        />
      </div>
    </section>
  );
}
