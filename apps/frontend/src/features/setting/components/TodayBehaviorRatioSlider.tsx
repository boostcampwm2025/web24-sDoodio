import { useState, useEffect, useMemo } from 'react';
import { BEHAVIOR_EXTRACTION_LEVELS, type User } from '@web24/shared';
import { debounce } from '@/shared/utils/debounce';

interface TodayBehaviorRatioSliderProps {
  user: User;
  updateBehaviorRatio: (ratio: number) => void;
}

export function TodayBehaviorRatioSlider({
  user,
  updateBehaviorRatio,
}: TodayBehaviorRatioSliderProps) {
  const [localRatio, setLocalRatio] = useState(user.behaviorRatio);

  useEffect(() => {
    setLocalRatio(user.behaviorRatio);
  }, [user.behaviorRatio]);

  const debouncedUpdate = useMemo(
    () =>
      debounce((ratio: number) => {
        updateBehaviorRatio(ratio);
      }, 500),
    [updateBehaviorRatio],
  );

  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number.parseFloat(e.target.value);
    setLocalRatio(newVal);
    debouncedUpdate(newVal);
  };

  return (
    <div className="flex flex-col gap-2">
      <span id="behavior-ratio-label" className="text-body-1 text-label-normal font-semibold">
        오늘의 행동 추출 강도
      </span>

      <div className="flex flex-col gap-4">
        <p className="text-label-2 text-label-disable text-sm">
          매일 추출되는 행동의 개수를 조절할 수 있어요.
        </p>

        <div className="flex-row">
          <div className="relative mt-4 mb-4 flex h-6 w-full items-center px-1">
            <div className="bg-bg-alternative absolute left-0 h-1.5 w-full rounded-full" />

            <div
              className="bg-primary-strong absolute left-0 h-1.5 rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${((localRatio - 0.2) / 0.6) * 100}%`,
              }}
            />

            <input
              id="ratio-slider"
              type="range"
              aria-labelledby="behavior-ratio-label"
              min={BEHAVIOR_EXTRACTION_LEVELS[0].value}
              max={BEHAVIOR_EXTRACTION_LEVELS.at(-1)!.value}
              step={0.2}
              value={localRatio}
              onChange={handleRatioChange}
              className="[&::-webkit-slider-thumb]:bg-primary-strong [&::-webkit-slider-thumb]:shadow-emphasize [&::-moz-range-thumb]:bg-primary-strong [&::-moz-range-thumb]:shadow-emphasize relative z-20 h-full w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:active:cursor-grabbing"
            />
          </div>
          <div className="flex justify-between px-1">
            {BEHAVIOR_EXTRACTION_LEVELS.map((level) => {
              const isActive = localRatio === level.value;
              return (
                <div key={level.value} className="flex flex-col items-center">
                  <span
                    className={`text-[10px] whitespace-nowrap transition-colors duration-200 ${
                      isActive ? 'text-primary-strong font-bold' : 'text-label-disable'
                    }`}
                  >
                    {level.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
