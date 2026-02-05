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

const checkIsToggleAction = (prevList: Behavior[], newList: Behavior[]) => {
  if (prevList.length !== newList.length) return false;

  return prevList.some((oldItem) => {
    const matchedItem = findItemById(newList, oldItem.id);
    return matchedItem && matchedItem.isChecked !== oldItem.isChecked;
  });
};

export function TodayBehaviorCardGrid({
  behaviors,
  onToggle,
  onDelete,
  openAddModal,
}: TodayBehaviorCardGridProps) {
  const [displayBehaviors, setDisplayBehaviors] = useState<Behavior[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const handleToggle = (behaviorId: string) => {
    setDisplayBehaviors((prev) =>
      prev.map((b) => (b.id === behaviorId ? { ...b, isChecked: !b.isChecked } : b)),
    );

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDisplayBehaviors((prev) => getSortedBehaviors(prev));
      onToggle(behaviorId);
    }, CHECK_SORT_DELAY_MS);
  };

  useEffect(() => {
    // 상위 props 변경이 토글로 인한 것이라면 무시
    setDisplayBehaviors((prev) => {
      const isToggle = checkIsToggleAction(prev, behaviors);
      if (isToggle) return prev;
      return getSortedBehaviors(behaviors);
    });
  }, [behaviors, getSortedBehaviors]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {displayBehaviors.map((behavior: Behavior) => (
        <BehaviorCard
          key={behavior.id}
          behavior={behavior}
          onToggle={() => handleToggle(behavior.id)}
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
