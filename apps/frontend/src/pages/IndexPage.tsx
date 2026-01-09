import { useState, useEffect } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { AIBehaviorContainer } from '@/features/behavior/components/AIBehaviorContainer';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBahaviorList } from '@/features/behavior/components/TodayBehaviorList';
import { fetchTodayBehaviors } from '@/features/behavior/apis/fetchBehaviors.api';

// 임시 목표 리스트
const mockGoals: string[] = ['ALL', '개발 서적', '드로잉 마스터', '건강한 생활'];

export function IndexPage() {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const { quote, resetQuote } = useDodoChatStore();

  const handleToggle = (id: string) => {
    setBehaviors((bs) => bs.map((b) => (b.id === id ? { ...b, isChecked: !b.isChecked } : b)));
  };

  useEffect(() => {
    fetchTodayBehaviors().then((data) => {
      setBehaviors(data);
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
    <div className="bg-bg-normal flex flex-col pt-2">
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
      <TodayBahaviorList goals={mockGoals} behaviors={behaviors.slice(1)} onToggle={handleToggle} />
    </div>
  );
}
