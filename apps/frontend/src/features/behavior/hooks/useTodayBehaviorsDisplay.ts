import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { BEHAVIOR_DIFFICULTIES } from '@web24/shared';
import { useState, useEffect, useRef, useCallback } from 'react';

const CHECK_SORT_DELAY_MS = 800;

interface ToggleBehaviorVars {
  id: string;
  nextStatus: 'pending' | 'completed' | 'skipped' | 'ignored' | 'deleted';
}

interface UseTodayBehaviorsDisplayProps {
  behaviors: Behavior[];
  toggleMutation: {
    mutate: (variables: ToggleBehaviorVars) => void;
  };
  handleRewardInteraction: (templateId?: string) => void;
}

const findItemById = (list: Behavior[], id: string): Behavior | undefined =>
  list.find((item) => item.id === id);

const checkIsToggleAction = (prevList: Behavior[], newList: Behavior[]): boolean => {
  if (!prevList || !newList || prevList.length !== newList.length) return false;
  return prevList.some((p) => {
    const n = findItemById(newList, p.id);
    return n && n.isChecked !== p.isChecked;
  });
};

export function useTodayBehaviorsDisplay({
  behaviors,
  toggleMutation,
  handleRewardInteraction,
}: UseTodayBehaviorsDisplayProps) {
  const [displayBehaviors, setDisplayBehaviors] = useState<Behavior[]>([]);
  const sortTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 정렬 로직
  const getSortedBehaviors = useCallback((list: Behavior[]): Behavior[] => {
    const rank = new Map(BEHAVIOR_DIFFICULTIES.map((d, i) => [d as string, i]));
    return [...list].sort((a, b) => {
      if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
      const aRank = rank.get(a.difficulty) ?? 99;
      const bRank = rank.get(b.difficulty) ?? 99;
      return aRank - bRank;
    });
  }, []);

  useEffect(() => {
    setDisplayBehaviors((prev) => {
      if (checkIsToggleAction(prev, behaviors)) return prev;
      return getSortedBehaviors(behaviors);
    });
  }, [behaviors, getSortedBehaviors]);

  const handleBehaviorToggle = useCallback(
    (id: string) => {
      const target = findItemById(displayBehaviors, id);
      if (!target) return;

      const nextIsChecked = !target.isChecked;
      const nextStatus = nextIsChecked ? 'completed' : 'pending';

      // UI 즉시 반영 (순서 고정)
      setDisplayBehaviors((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isChecked: nextIsChecked } : b)),
      );

      // 두두 인터랙션 즉시 실행
      if (nextStatus === 'completed') {
        handleRewardInteraction(target.goalTemplateId);
      }

      // 지연 정렬 및 API 요청
      if (sortTimeoutRef.current) clearTimeout(sortTimeoutRef.current);

      sortTimeoutRef.current = setTimeout(() => {
        toggleMutation.mutate({ id, nextStatus });
        // 정렬 수행
        setDisplayBehaviors((prev) => getSortedBehaviors(prev));
        sortTimeoutRef.current = null;
      }, CHECK_SORT_DELAY_MS);
    },
    [displayBehaviors, getSortedBehaviors, handleRewardInteraction, toggleMutation],
  );

  useEffect(
    () => () => {
      if (sortTimeoutRef.current) clearTimeout(sortTimeoutRef.current);
    },
    [],
  );

  return {
    displayBehaviors,
    handleBehaviorToggle,
  };
}
