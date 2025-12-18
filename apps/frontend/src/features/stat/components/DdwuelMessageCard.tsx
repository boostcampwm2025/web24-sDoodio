export function DdwuelMessageCard({
  isLoading,
  trendLabel,
  topCategoryName,
}: {
  isLoading: boolean;
  trendLabel: string;
  topCategoryName: string;
}) {
  return (
    <section className="rounded-3xl bg-gray-700 px-5 py-6 text-white shadow-sm md:px-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-200 text-gray-900">
            <span className="text-xs font-extrabold tracking-tight">
              뚜웰의
              <br />한 마디
            </span>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-72 animate-pulse rounded bg-white/15" />
                <div className="h-4 w-80 animate-pulse rounded bg-white/10" />
              </div>
            ) : (
              <>
                <p>{trendLabel}</p>
                이번 달은 <span className="font-semibold text-white">{topCategoryName}</span>에서
                특히 자연스럽게 시작했어요. “되는 순간”에 살짝 얹어두면 더 편해져요.
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
