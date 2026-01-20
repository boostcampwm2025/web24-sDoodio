import { useState, useEffect } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { AIBehaviorContainer } from '@/features/behavior/components/AIBehaviorContainer';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBehaviorList } from '@/features/behavior/components/TodayBehaviorList';
import { fetchTodayBehaviors } from '@/features/behavior/apis/fetchBehaviors.api';
import { fetchGoals } from '@/features/goal/apis/fetchGoals.api';
import { updateTodayBehaviorStatus } from '@/features/behavior/apis/updateTodayBehaviorStatus.api';
import { useAIBehaviors } from '@/features/behavior/hooks/useAIBehaviors';
import { updateAIBehaviorStatus } from '@/features/behavior/apis/updateAIBehaviorStatus.api';
import { refreshTodayBehaviors } from '@/features/behavior/apis/refreshTodayBehaviors.api';
import { deleteTodayBehavior } from '@/features/behavior/apis/deleteTodayBehavior.api';
import { toast } from 'react-toastify';

export function IndexPage() {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [goalTitles, setGoalTitles] = useState<string[]>([]);
  const { quote, resetQuote } = useDodoChatStore();
  const {
    behaviors: aiBehaviors,
    setBehaviors: setAIBehaviors,
    isLoading,
    isMaking,
  } = useAIBehaviors();

  const toggleBehaviorIsChecked = (behaviorId: string) => {
    setBehaviors((bs) =>
      bs.map((b) => (b.id === behaviorId ? { ...b, isChecked: !b.isChecked } : b)),
    );
  };

  const toggleAIBehaviorIsChecked = (behaviorId: string) => {
    setAIBehaviors((bs) =>
      bs.map((b) => (b.id === behaviorId ? { ...b, isChecked: !b.isChecked } : b)),
    );
  };

  const handleBehaviorToggle = (id: string) => {
    const targetBehavior = behaviors.find((bs) => bs.id === id);
    if (!targetBehavior) return;

    toggleBehaviorIsChecked(id);

    const nextStatus = targetBehavior.isChecked ? 'pending' : 'completed';
    updateTodayBehaviorStatus(id, nextStatus).catch(() => toggleBehaviorIsChecked(id));
  };

  const removeBehavior = (behaviorId: string) => {
    setBehaviors((bs) => bs.filter((b) => b.id !== behaviorId));
  };

  const handleBehaviorDelete = async (id: string) => {
    try {
      await deleteTodayBehavior(id);
      removeBehavior(id);
    } catch {
      toast('삭제에 실패했습니다.');
    }
  };

  const handleAIBehaviorToggle = (id: string) => {
    const targetBehavior = aiBehaviors.find((bs) => bs.id === id);
    if (!targetBehavior) return;

    toggleAIBehaviorIsChecked(id);

    const nextStatus = targetBehavior.isChecked ? 'pending' : 'completed';
    updateAIBehaviorStatus(id, nextStatus).catch(() => toggleAIBehaviorIsChecked(id));
  };

  const handleRefreshTodayBehaviors = () => {
    refreshTodayBehaviors()
      .then((refreshedBehaviors) => setBehaviors(refreshedBehaviors))
      .catch(() => {
        toast('새로고침에 실패했습니다.');
      });
  };

  useEffect(() => {
    Promise.all([fetchTodayBehaviors(), fetchGoals()]).then(([behaviorsData, goalsData]) => {
      setBehaviors(behaviorsData);
      setGoalTitles(['ALL', ...goalsData.map((g) => g.title)]);
    });
  }, []);

  useEffect(
    () => () => {
      resetQuote();
    },
    [resetQuote],
  );

  return (
    <div className="bg-bg-normal mx-auto flex max-w-5xl flex-col pt-2">
      {/* 두두의 말 */}
      <Hero quote={quote} />

      {/* AI 추천 행동 */}
      <AIBehaviorContainer
        behaviors={aiBehaviors}
        isLoading={isLoading}
        isMaking={isMaking}
        onToggle={handleAIBehaviorToggle}
      />

      {/* 오늘의 행동 */}
      <TodayBehaviorList
        goals={goalTitles}
        behaviors={behaviors}
        onToggle={handleBehaviorToggle}
        onRefresh={handleRefreshTodayBehaviors}
        onDelete={handleBehaviorDelete}
      />
    </div>
  );
}
