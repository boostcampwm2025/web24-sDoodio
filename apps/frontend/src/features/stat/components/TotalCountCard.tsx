import { BarChart3 } from 'lucide-react';

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function TotalCountCard({ count, isLoading }: { count: number | null; isLoading: boolean }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-800">이때까지 행동한 총 횟수</h3>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <BarChart3 aria-hidden size={18} />
        </div>
      </header>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-3xl font-extrabold tracking-tight text-gray-900">
          {isLoading ? '—' : `${formatNumber(count ?? 0)}회`}
        </p>
        <p className="text-sm text-gray-600">오늘의 한 번이 내일의 ‘시작’을 더 가볍게 만들어요.</p>
      </div>
    </section>
  );
}
