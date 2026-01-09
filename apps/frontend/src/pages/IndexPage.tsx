import { useState, useEffect } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { AIBehaviorContainer } from '@/features/behavior/components/AIBehaviorContainer';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBahaviorList } from '@/features/behavior/components/TodayBehaviorList';
import { fetchTodayBehaviors } from '@/features/behavior/apis/fetchBehaviors.api';
import { fetchGoals } from '@/features/goal/apis/fetchGoals.api';

export function IndexPage() {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [goalTitles, setGoalTitles] = useState<string[]>([]);
  const { quote, resetQuote } = useDodoChatStore();

  const handleToggle = (id: string) => {
    setBehaviors((bs) => bs.map((b) => (b.id === id ? { ...b, isChecked: !b.isChecked } : b)));
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

  const aiBehavior = behaviors[0];

  return (
    <div className="bg-bg-normal mx-auto flex max-w-5xl flex-col pt-2">
      {/* 두두의 말 */}
      <Hero quote={quote} />

      {/* AI 추천 행동 */}
      {aiBehavior && (
        <AIBehaviorContainer
          behavior={behaviors[0]}
          onToggle={() => handleToggle(behaviors[0].id)}
        />
      )}

      {/* 오늘의 행동 */}
      <TodayBahaviorList
        goals={goalTitles}
        behaviors={behaviors.slice(1)}
        onToggle={handleToggle}
      />
    </div>
  );
}
