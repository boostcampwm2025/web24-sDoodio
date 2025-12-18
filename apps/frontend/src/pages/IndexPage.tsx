import { Hero } from '@/features/home/components/Hero';
import { HabitGrid } from '@/features/home/components/HabitGrid';

export function IndexPage() {
  return (
    <div className="flex flex-col pt-2">
      <Hero nickname="뚜웰" quote="완벽하지 않아도 일단 해보면 재미있을거야!" />
      <HabitGrid variant="grid" />
    </div>
  );
}
