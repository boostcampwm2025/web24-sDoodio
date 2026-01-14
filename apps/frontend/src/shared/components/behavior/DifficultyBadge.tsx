import { DIFFICULTY_COLOR_STYLES } from '@/shared/constants/difficultyColor';
import type { BehaviorDifficulty } from '@web24/shared';

export function DifficultyBadge({ level }: { level: BehaviorDifficulty }) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY_COLOR_STYLES[level].bg} ${DIFFICULTY_COLOR_STYLES[level].txt} border border-current/10`}
    >
      {level}
    </span>
  );
}
