import { useState, useMemo } from 'react';
import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SwiperTabs } from './SwiperTabs';

interface BehaviorListProps {
  goals: string[];
  behaviors: Behavior[];
  onToggle: (id: string) => void;
}

export function TodayBahaviorList({ goals, behaviors, onToggle }: BehaviorListProps) {
  const [activeGoal, setActiveGoal] = useState<string>('ALL');
  const navigate = useNavigate();

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
      <div className="relative mb-2 flex items-center justify-around gap-2">
        {/* Tabs */}
        <div className="relative flex-1 overflow-hidden">
          {/* slideOffsetAfter : 슬라이더 맨 오른쪽 여백으로 오른쪽 그라데이션 오버레이의 너비랑 맞춤 */}
          <SwiperTabs tabs={goals} onChange={setActiveGoal} slideOffsetAfter={48} />
          {/* 오른쪽 그라데이션 오버레이 */}
          <div className="from-bg-normal via-bg-normal/80 pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-linear-to-l to-transparent" />
        </div>

        {/* + Button */}
        <button
          type="button"
          className="flex shrink-0 items-center justify-center gap-1 pb-1"
          onClick={() => navigate('/goals/new')}
        >
          <Plus className="text-label-disable h-5 w-5" />
          <span className="text-label-disable text-sm font-semibold">목표</span>
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
