import { useEffect } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { AIBehaviorCard } from '@/features/behavior/components/AIBehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBahaviorList } from '@/features/behavior/components/TodayBehaviorList';

export const mockBehaviorCard: Behavior = {
  id: 'card-1',
  title: '물 2L 마시기',
  goalTitle: '건강한 생활',
  goalColor: 'bg-goal-2',
  isChecked: false,
  difficulty: '몰입하기',
  isRecommended: true,
};

export const mockTodayBehaviorList: Behavior[] = [
  mockBehaviorCard,
  mockBehaviorCard,
  mockBehaviorCard,
];

export function IndexPage() {
  const { quote, resetQuote } = useDodoChatStore();

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
      <AIBehaviorCard behavior={mockBehaviorCard} onToggle={() => {}} />
      <TodayBahaviorList behaviors={mockTodayBehaviorList} onToggle={() => {}} />
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
