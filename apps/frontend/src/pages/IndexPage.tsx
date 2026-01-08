import { useState, useEffect } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { AIBehaviorContainer } from '@/features/behavior/components/AIBehaviorContainer';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBahaviorList } from '@/features/behavior/components/TodayBehaviorList';

export const mockBehaviorCard: Behavior = {
  id: 'card-1',
  title: '물 2L 마시기',
  goalTitle: '건강한 생활',
  goalColor: 'bg-goal-pink',
  isChecked: false,
  difficulty: '몰입하기',
  isRecommended: true,
};

export const mockTodayBehaviorList: Behavior[] = [
  mockBehaviorCard,
  { ...mockBehaviorCard, id: 'card2' },
  { ...mockBehaviorCard, id: 'card3' },
  { ...mockBehaviorCard, id: 'card4' },
];

export const mockGoals: string[] = [
  'ALL',
  'hello',
  'bye',
  'good',
  'very very good',
  '건강한 생활',
  'yesyeyseysey',
  'djfkljdsklafjkl',
];

export function IndexPage() {
  const [behaviors, setBehaviors] = useState<Behavior[]>(mockTodayBehaviorList);
  const { quote, resetQuote } = useDodoChatStore();

  const handleToggle = (id: string) => {
    setBehaviors((bs) => bs.map((b) => (b.id === id ? { ...b, isChecked: !b.isChecked } : b)));
  };

  useEffect(
    () => () => {
      resetQuote();
    },
    [resetQuote],
  );

  return (
    <div className="bg-bg-normal flex flex-col pt-2">
      <Hero quote={quote} />
      {/* 테스트 */}
      <AIBehaviorContainer behavior={behaviors[0]} onToggle={() => handleToggle(behaviors[0].id)} />
      <TodayBahaviorList goals={mockGoals} behaviors={behaviors.slice(1)} onToggle={handleToggle} />
      {/* <AICard />
      behavior 폴더
      comoponent
      behaviorCard
      TodayBehviorCard
      AIBehaviorCard
      <TodayBehaviorGrid /> */}
    </div>
  );
}
