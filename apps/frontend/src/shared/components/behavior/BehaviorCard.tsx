import type { Behavior, Difficulty } from '@/shared/components/behavior/BehaviorCard.types';
import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import { DIFFICULTY_COLOR_STYLES } from '@/shared/constants/difficultyColor';
import StickerCell from './StickerCell';

interface BehaviorProps {
  behavior: Behavior;
  onToggle: () => void;
}

function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY_COLOR_STYLES[level].bg} ${DIFFICULTY_COLOR_STYLES[level].txt} border border-current/10`}
    >
      {level}
    </span>
  );
}

export function BehaviorCard({ behavior, onToggle }: BehaviorProps) {
  const bgColor = GOAL_COLOR_STYLES[behavior.goalColor].bg;

  return (
    <div
      className={`group bg-bg-light relative flex items-center gap-4 rounded-2xl px-7 py-5 transition-all duration-500 ${
        behavior.isChecked
          ? 'border-bg-alternative bg-bg-light scale-[0.99] opacity-60 shadow-none saturate-50'
          : 'border-transparent shadow-(--shadow-normal) hover:-translate-y-1 hover:shadow-(--shadow-strong)'
      } `}
    >
      {/* 왼쪽 컬러 바 */}
      <div className={`absolute top-0 bottom-0 left-0 w-3.5 rounded-l-2xl ${bgColor}`} />
      <div className="flex-1 pl-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="bg-bg-alternative text-label-disable rounded px-2 py-0.5 text-xs font-bold">
            {behavior.goalTitle}
          </span>
        </div>
        <h4
          className={`text-base font-bold transition-all duration-300 ${
            behavior.isChecked ? 'text-label-disable line-through' : 'text-label-normal'
          }`}
        >
          {behavior.title}
        </h4>
        <div className="mt-2 flex gap-2">
          <DifficultyBadge level={behavior.difficulty} />
        </div>
      </div>
      {/* 토글 버튼 */}
      <StickerCell
        isFilled={behavior.isChecked}
        isClickable
        onClick={onToggle}
        ariaLabel={`${behavior.title} 완료 토글`}
        ariaPressed={behavior.isChecked}
        stickerColor={behavior.goalColor}
      />{' '}
    </div>
  );
}
