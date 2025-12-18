import { useEffect } from 'react';

import { useBehaviorPoolStore } from '@/stores/useBehaviorPoolStore';
import { useTodayBehaviorStore } from '@/stores/useTodayBehaviorStore';
import { BEHAVIOR_CATEGORIES } from '@/shared/constants/behaviorCategory';
import { HabitCard } from './HabitCard';

interface HabitGridProps {
  variant: 'grid' | 'masonry';
}

export function HabitGrid({ variant }: HabitGridProps) {
  const { items: todayItems, incrementCount, drawRandomFromPool } = useTodayBehaviorStore();
  const { items: poolItems, seedDefaultsIfEmpty } = useBehaviorPoolStore();

  useEffect(() => {
    seedDefaultsIfEmpty();

    if (todayItems.length === 0) {
      const poolCount = useBehaviorPoolStore.getState().items.length;
      if (poolCount > 0) {
        drawRandomFromPool(5, { now: new Date() });
      }
    }
  });

  const habits = todayItems
    .map((todayItem) => {
      const definition = poolItems.find((p) => p.id === todayItem.behaviorId);
      if (!definition) return null;

      const categoryInfo =
        BEHAVIOR_CATEGORIES.find((v) => v.id === definition.categoryId) ?? BEHAVIOR_CATEGORIES[0];

      return {
        id: definition.id,
        title: definition.title,
        description: definition.description || '습관에 대한 설명입니다.',
        category: categoryInfo,
        currentCount: todayItem.currentCount,
        onStickerClick: () => incrementCount(definition.id),
      };
    })
    .filter(Boolean);

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-zinc-900">오늘은 어떤 행동을 해볼까요?</h2>

      <div
        className={
          variant === 'grid'
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'columns-1 gap-4 sm:columns-2 lg:columns-3'
        }
      >
        {habits.map(
          (habit) =>
            habit && (
              <HabitCard
                key={habit.id}
                title={habit.title}
                category={habit.category}
                description={habit.description}
                currentCount={habit.currentCount}
                onStickerClick={habit.onStickerClick}
                variant={variant}
              />
            ),
        )}

        {habits.length === 0 && (
          <div className="col-span-full py-10 text-center text-zinc-400">
            행동을 불러오는 중입니다...
          </div>
        )}
      </div>
    </section>
  );
}
