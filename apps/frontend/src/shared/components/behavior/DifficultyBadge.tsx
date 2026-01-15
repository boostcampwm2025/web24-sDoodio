import { DIFFICULTY_COLOR_STYLES } from '@/shared/constants/difficultyColor';
import type { BehaviorDifficulty } from '@web24/shared';

interface DifficultyBadgeProps {
  level: BehaviorDifficulty;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DifficultyBadge({
  level,
  count,
  selected = false,
  onClick,
  className = '',
}: DifficultyBadgeProps) {
  const interactiveClass = onClick ? 'cursor-pointer transition hover:opacity-100' : '';
  const isActive = onClick ? selected : true;
  const selectedClass = isActive ? 'opacity-100' : 'opacity-60';

  const badgeClass = [
    'flex shrink-0 items-center gap-1 rounded-full',
    'border border-current/10',
    'text-[10px] font-bold',
    'px-2 py-0.5',
    DIFFICULTY_COLOR_STYLES[level].bg,
    DIFFICULTY_COLOR_STYLES[level].txt,
    interactiveClass,
    selectedClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={badgeClass}>
        <span>{level}</span>
        {typeof count === 'number' && <span className="text-[9px] font-semibold">{count}</span>}
      </button>
    );
  }

  return (
    <span className={badgeClass}>
      <span>{level}</span>
      {typeof count === 'number' && <span className="text-[9px] font-semibold">{count}</span>}
    </span>
  );
}
