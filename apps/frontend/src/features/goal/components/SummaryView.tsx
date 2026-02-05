import { BEHAVIOR_DIFFICULTIES, type BehaviorDifficulty, type GoalColor } from '@web24/shared';
import { ChevronRight } from 'lucide-react';
import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';
import type { BehaviorItem } from './BehaviorSelection';

interface SummaryViewProps {
  goalTitle: string;
  goalColor: GoalColor;
  behaviorsMap: Record<Exclude<BehaviorDifficulty, 'AI'>, BehaviorItem[]>;
  onEditStep: (stepIndex: number) => void;
}

export function SummaryView({ goalTitle, goalColor, behaviorsMap, onEditStep }: SummaryViewProps) {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto pr-2 pb-4">
        {/* 목표 헤더 */}
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className={`group relative cursor-pointer overflow-hidden rounded-3xl p-6 shadow-lg transition-all hover:scale-[0.98] ${GOAL_COLOR_STYLES[goalColor].bg}`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="bg-bg-light/20 text-bg-light rounded-full px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
              수정
            </span>
          </div>
          <span className="text-bg-light/60 mb-1 block text-[10px] font-bold tracking-widest">
            MY GOAL
          </span>
          <h3 className="text-bg-light text-2xl leading-tight font-bold">
            {goalTitle || '제목 없음'}
          </h3>
        </button>

        {/* 난이도 별 행동 리스트 */}
        {BEHAVIOR_DIFFICULTIES.filter((difficulty) => difficulty !== 'AI').map(
          (difficulty, idx) => {
            const items = behaviorsMap[difficulty];
            const stepIndex = idx + 2;

            return (
              <button
                type="button"
                key={difficulty}
                onClick={() => onEditStep(stepIndex)}
                className="group border-primary-weak bg-bg-light hover:border-primary-strong cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <DifficultyBadge
                    level={difficulty}
                    className="px-3 py-1 text-[14px]"
                    count={items.length}
                  />
                  <span className="text-label-disable/70 group-hover:text-label-disable flex items-center gap-1 text-[12px] font-bold transition-colors">
                    수정 <ChevronRight size={12} />
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-bg-alternative/50 border-primary-strong flex items-center gap-2 rounded-xl border p-3"
                    >
                      <span className="text-label-alternative text-sm leading-snug font-medium">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
