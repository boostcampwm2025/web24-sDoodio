import { CalendarDays } from 'lucide-react';

export function StatsPeriodHeader({
  period,
  isLoading,
}: {
  period: { year: number; month: number } | null;
  isLoading: boolean;
}) {
  const label = period ? `${period.year}년 ${period.month}월` : '통계를 불러오는 중…';

  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
          <CalendarDays aria-hidden size={14} />
          <span className={isLoading ? 'opacity-80' : undefined}>{label}</span>
        </span>
      </div>
    </header>
  );
}
