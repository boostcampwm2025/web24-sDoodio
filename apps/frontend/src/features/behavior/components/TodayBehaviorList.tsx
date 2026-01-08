import { useState, useMemo } from 'react';
import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { Plus, CirclePlus } from 'lucide-react';
import { SwiperTabs } from './SwiperTabs';

interface BehaviorListProps {
  goals: string[];
  behaviors: Behavior[];
  onToggle: (id: string) => void;
}

export function TodayBahaviorList({ goals, behaviors, onToggle }: BehaviorListProps) {
  const [activeGoal, setActiveGoal] = useState<string | 'ALL'>('ALL');

  const filteredBehaviors = useMemo(() => {
    if (activeGoal === 'ALL') return behaviors;
    return behaviors.filter((behavior) => behavior.goalTitle === activeGoal);
  }, [behaviors, activeGoal]);

  return (
    <div className="mb-4 flex-col items-center justify-between px-4">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-bold">
        <span>오늘의 행동</span>
        <span className="rounded-full px-2 py-0.5 text-xs font-bold">{behaviors.length}</span>
      </h3>

      {/* 목표 필터 탭 스와이퍼 */}
      <div className="relative mb-2 flex items-center">
        {/* Tabs */}
        <div className="flex-1 overflow-hidden pr-10">
          <SwiperTabs tabs={goals} onChange={setActiveGoal} />
        </div>

        {/* + Button */}
        <button
          type="button"
          className="absolute top-1/2 right-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
        >
          <CirclePlus className="text-label-disable" />
        </button>
      </div>

      {/* 행동 카드들 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredBehaviors.map((behavior: Behavior) => (
          <BehaviorCard
            key={behavior.id}
            behavior={behavior}
            onToggle={() => onToggle(behavior.id)}
          />
        ))}

        {/* 행동 추가 버튼 */}
        <button
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
    </div>
  );
}
