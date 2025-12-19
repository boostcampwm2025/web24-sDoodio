import { Link } from 'react-router-dom';

import { StickerBoard } from '@/shared/components/StickerBoard';
import type { BehaviorCategory } from '@/shared/constants/behaviorCategory';

interface HabitCardProps {
  title: string;
  category: BehaviorCategory;
  description: string;
  currentCount: number;
  onStickerClick: () => void;
  variant: 'grid' | 'masonry';
}

export function HabitCard({
  title,
  category,
  description,
  currentCount,
  onStickerClick,
  variant,
}: HabitCardProps) {
  return (
    <div
      className={[
        'group flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all',
        'hover:-translate-y-1 hover:shadow-md',
        variant === 'grid' ? 'max-h-80' : 'mb-4 break-inside-avoid',
      ].join(' ')}
    >
      <Link to="/behavior/1">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.label}
          </span>
        </div>
        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-zinc-500">{description}</p>
      </Link>

      <div className="flex justify-center">
        <StickerBoard currentCount={currentCount} onStickerClick={onStickerClick} columns={5} />
      </div>
    </div>
  );
}
