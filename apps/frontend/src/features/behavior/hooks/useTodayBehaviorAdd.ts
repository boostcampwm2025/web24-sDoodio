import { useEffect, useMemo, useState } from 'react';
import type { Behavior, GetGoalSummary } from '@web24/shared';
import { toast } from 'react-toastify';
import { fetchGoalBehaviors } from '@/features/goal/apis/fetchGoalBehaviors.api';

interface UseTodayBehaviorAddOptions {
  goals: GetGoalSummary[];
  onAddBehavior: (behaviorId: string) => Promise<void>;
}

export function useTodayBehaviorAdd({ goals, onAddBehavior }: UseTodayBehaviorAddOptions) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalBehaviors, setGoalBehaviors] = useState<Behavior[]>([]);
  const [isLoadingBehaviors, setIsLoadingBehaviors] = useState(false);
  const [isAddingBehavior, setIsAddingBehavior] = useState(false);

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? null,
    [goals, selectedGoalId],
  );

  useEffect(() => {
    const { overflow } = document.body.style;
    if (isAddOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isAddOpen]);

  const openAddModal = () => {
    setIsAddOpen(true);
    setSelectedGoalId(null);
    setGoalBehaviors([]);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
    setSelectedGoalId(null);
    setGoalBehaviors([]);
    setIsLoadingBehaviors(false);
  };

  const resetGoalSelection = () => {
    setSelectedGoalId(null);
    setGoalBehaviors([]);
  };

  const handleGoalSelect = async (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsLoadingBehaviors(true);
    setGoalBehaviors([]);
    try {
      const data = await fetchGoalBehaviors(goalId);
      setGoalBehaviors(data);
    } catch {
      toast('행동 목록을 불러오지 못했어요.');
    } finally {
      setIsLoadingBehaviors(false);
    }
  };

  const handleBehaviorSelect = async (behaviorId: string) => {
    if (isAddingBehavior) return;
    setIsAddingBehavior(true);
    try {
      await onAddBehavior(behaviorId);
      closeAddModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.toLowerCase().includes('already')) {
        toast('이미 존재합니다.');
      } else {
        toast('오늘 행동을 추가하지 못했어요.');
      }
    } finally {
      setIsAddingBehavior(false);
    }
  };

  return {
    isAddOpen,
    openAddModal,
    closeAddModal,
    selectedGoal,
    isLoadingBehaviors,
    goalBehaviors,
    handleGoalSelect,
    handleBehaviorSelect,
    resetGoalSelection,
  };
}
