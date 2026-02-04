import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { BEHAVIOR_DIFFICULTIES } from '@web24/shared';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TodayBehaviorCardGridProps {
  behaviors: Behavior[];
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  openAddModal: () => void;
}

const findItemById = (list: Behavior[], id: string) => list.find((item) => item.id === id);

export function TodayBehaviorCardGrid({
  behaviors,
  onToggle,
  onDelete,
  openAddModal,
}: TodayBehaviorCardGridProps) {
  const [displayBehaviors, setDisplayBehaviors] = useState<Behavior[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevBehaviorsRef = useRef<Behavior[]>(behaviors);
  const CHECK_SORT_DELAY_MS = 800;

  const getSortedBehaviors = useCallback((list: Behavior[]) => {
    const difficultyRank = new Map(
      BEHAVIOR_DIFFICULTIES.map((difficulty, index) => [difficulty, index]),
    );
    return [...list].sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      const difficultyDelta =
        (difficultyRank.get(a.difficulty) ?? Number.POSITIVE_INFINITY) -
        (difficultyRank.get(b.difficulty) ?? Number.POSITIVE_INFINITY);
      return difficultyDelta === 0 ? 0 : difficultyDelta;
    });
  }, []);

  const syncDisplayWithNewData = useCallback(
    (currentDisplay: Behavior[]) => currentDisplay.map((d) => findItemById(behaviors, d.id) || d),
    [behaviors],
  );

  useEffect(() => {
    const prevBehaviors = prevBehaviorsRef.current;

    // 토글 동작인지 확인
    const isToggleAction =
      prevBehaviors.length === behaviors.length &&
      behaviors.some((newItem) => {
        const prevItem = findItemById(prevBehaviors, newItem.id);
        return prevItem?.isChecked !== newItem.isChecked;
      });

    if (isToggleAction) {
      setDisplayBehaviors(syncDisplayWithNewData);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDisplayBehaviors(getSortedBehaviors(behaviors));
      }, CHECK_SORT_DELAY_MS);
    } else {
      setDisplayBehaviors(getSortedBehaviors(behaviors));
    }

    // 다음 비교를 위해 저장
    prevBehaviorsRef.current = behaviors;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [behaviors, getSortedBehaviors, syncDisplayWithNewData]);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {displayBehaviors.map((behavior: Behavior) => (
        <BehaviorCard
          key={behavior.id}
          behavior={behavior}
          onToggle={() => onToggle(behavior.id)}
          onDelete={onDelete ? () => onDelete(behavior.id) : undefined}
        />
      ))}

      {/* 행동 추가 버튼 */}
      <button
        onClick={() => {
          openAddModal();
        }}
        type="button"
        className="group border-primary-weak text-primary-normal hover:border-primary-strong hover:text-primary-strong hover:bg-primary-weak/30 relative flex min-h-30 cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed bg-transparent p-5 transition-all"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="bg-bg-alternative group-hover:bg-primary-strong group-hover:text-bg-light flex h-10 w-10 items-center justify-center rounded-full transition-colors">
            <Plus size={20} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold">행동 추가</span>
        </div>
      </button>
    </div>
  );
}
