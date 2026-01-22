import { useEffect, useState } from 'react';
import { BEHAVIOR_DIFFICULTIES, type GetDifficultyStatsResponse } from '@web24/shared';
import { DIFFICULTY_COLOR_STYLES } from '@/shared/constants/difficultyColor';
import { fetchDifficultyStats } from './apis/fetchDifficultyStats.api';

export function DifficultyGraph() {
  const [stats, setStats] = useState<GetDifficultyStatsResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchDifficultyStats()
      .then(setStats)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="text-label-disable flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-body-1 font-semibold">에러가 발생했어요.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="text-label-disable flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-body-1 font-semibold">조금 더 쌓이면 보여줄 수 있어요.</p>
      </div>
    );
  }

  const currentData = selectedIndex !== null ? stats[selectedIndex] : null;
  const totalCounts = stats.reduce(
    (acc, day) => {
      BEHAVIOR_DIFFICULTIES.forEach((diff) => {
        acc[diff] = (acc[diff] || 0) + day[diff];
        acc.total += day[diff];
      });
      return acc;
    },
    { total: 0 } as Record<string, number>,
  );

  const displayData = currentData || totalCounts;
  const displayTotal =
    selectedIndex !== null && currentData
      ? BEHAVIOR_DIFFICULTIES.reduce((sum, diff) => sum + currentData[diff], 0)
      : (totalCounts.total as number);

  // 일주일 간의 날짜 레이블 (가상)
  const labels = ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '어제'].slice(
    -stats.length,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 그래프 영역 */}
      <div className="bg-bg-alternative flex items-center justify-between rounded-2xl px-5 pt-5 pb-2">
        {stats.map((day, idx) => {
          const dayTotal = BEHAVIOR_DIFFICULTIES.reduce((sum, diff) => sum + day[diff], 0);
          const isSelected = selectedIndex === null || selectedIndex === idx;
          const isEmpty = dayTotal === 0;

          return (
            <div key={`${labels[idx]}`} className="flex flex-1 flex-col items-center gap-5">
              <button
                type="button"
                className="bg-primary-weak hover:bg-primary-normal relative flex h-32 w-4 flex-col-reverse overflow-hidden rounded-t-md transition-all sm:w-8"
                onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
              >
                {!isEmpty &&
                  BEHAVIOR_DIFFICULTIES.map((diff) => {
                    const count = day[diff];
                    if (count === 0) return null;

                    const ratioHeight = (count / dayTotal) * 100;

                    return (
                      <div
                        key={`${day}-${diff}`}
                        style={{ height: `${ratioHeight}%` }}
                        className={`${DIFFICULTY_COLOR_STYLES[diff].bg} w-full transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-30 grayscale'
                        }`}
                      />
                    );
                  })}

                {/* 선택 오버레이 */}
                {selectedIndex === idx && (
                  <div className="border-primary-strong absolute inset-0 rounded-t-md border-2" />
                )}
              </button>
              <span
                className={`text-caption-1 transition-colors ${isSelected ? 'text-label-normal' : 'text-label-disable'}`}
              >
                {labels[idx]}
              </span>
            </div>
          );
        })}
      </div>

      {/* 하단 문구 영역 */}
      <div className="flex flex-col gap-4 p-5">
        <h4 className="text-headline-2 text-label-alternative font-semibold">
          {selectedIndex !== null
            ? `${labels[selectedIndex]}에는 이만큼 해내셨네요!`
            : '일주일 동안 이만큼 해내셨네요!'}
        </h4>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {BEHAVIOR_DIFFICULTIES.filter((diff) => diff !== 'AI').map((diff) => (
            <div
              key={diff}
              className={`flex flex-col gap-1 ${DIFFICULTY_COLOR_STYLES[diff].bg} border-di items-center justify-center rounded-2xl p-1`}
            >
              <span className="text-label-2 text-label-alternative font-semibold">{diff}</span>
              <span className="text-headline-2 font-semibold">{displayData[diff] || 0}회</span>
            </div>
          ))}
        </div>
        <span className="text-primary-strong text-body-1 self-center font-bold">
          총 {displayTotal}회
        </span>
      </div>
    </div>
  );
}
