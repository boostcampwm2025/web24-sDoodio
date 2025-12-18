import { ChevronRight, Plus, Stamp, Star } from 'lucide-react';
import { useState } from 'react';
import type { BehaviorStampProps } from '../types/behavior.types';

function BehaviorStamp({ info, onStamp }: BehaviorStampProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const { isStampedToday, totalStamps } = info;

  // 화면에 보여줄 도장 개수 계산
  const historyCount = isStampedToday ? totalStamps - 1 : totalStamps;
  const visibleHistoryStamps = Math.min(historyCount, 4);

  const handleStampClick = () => {
    if (!isStampedToday) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
      onStamp();
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-gray-800">
            <Stamp size={20} className="text-indigo-500" />
            행동 도장
          </h3>
          <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
            Total {totalStamps}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-5 place-items-center gap-2 px-1">
          {/* 과거 스탬프들 */}
          {Array.from({ length: visibleHistoryStamps }).map((_, i) => {
            const stampNumber = historyCount - i;
            return (
              <div
                key={`stamp-history-${stampNumber}`}
                className="relative h-12 w-12 opacity-50 grayscale-[0.3] md:h-14 md:w-14"
              >
                <div className="absolute inset-0 flex rotate-[-10deg] items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-50 text-indigo-400">
                  <Star size={20} fill="currentColor" />
                </div>
              </div>
            );
          })}

          {/* 오늘 찍을 도장 */}
          <button
            type="button"
            onClick={handleStampClick}
            disabled={isStampedToday}
            className="relative h-12 w-12 flex-shrink-0 cursor-pointer transition-all duration-200 focus:outline-none md:h-14 md:w-14"
            aria-label={isStampedToday ? '오늘 도장 완료' : '도장 찍기'}
          >
            {isStampedToday ? (
              <div
                className={`absolute inset-0 z-10 flex items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-100 text-indigo-600 shadow-sm transition-transform duration-300 ease-out ${isAnimating ? 'rotate-12 scale-125' : 'rotate-[-5deg] scale-100'} `}
              >
                <Star size={20} fill="currentColor" />
                <div className="absolute -bottom-2 right-0 rounded-full border border-white bg-indigo-600 px-1.5 py-0.5 text-[9px] leading-none text-white">
                  TODAY
                </div>
              </div>
            ) : (
              <div className="group absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50/50 transition-colors hover:bg-indigo-100">
                <Plus size={20} className="text-indigo-400" />
                <div className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-red-400" />
              </div>
            )}
          </button>
        </div>
      </div>

      <button
        className="group mt-auto flex w-full items-center justify-center gap-1 rounded-xl py-3 text-sm text-gray-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
        type="button"
      >
        <span>전체 스탬프 보기</span>
        <ChevronRight
          size={16}
          className="translate-x-0 transform transition-transform duration-200 ease-in-out group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}

export default BehaviorStamp;
