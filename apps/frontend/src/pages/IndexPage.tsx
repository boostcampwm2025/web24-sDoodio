import { useEffect } from 'react';
import { Hero } from '@/features/home/components/Hero';
import { HabitGrid } from '@/features/home/components/HabitGrid';
import useDodoChatStore from '@/stores/useDodoChatStore';

export function IndexPage() {
  const { quote, resetQuote } = useDodoChatStore();

  useEffect(
    () => () => {
      resetQuote();
    },
    [resetQuote],
  );

  return (
    <div className="flex flex-col pt-2">
      <Hero nickname="뚜웰" quote={quote} />
      <HabitGrid variant="masonry" />
    </div>
  );
}
