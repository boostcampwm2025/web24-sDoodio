import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { Plus, Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ICON_SIZE } from '@/shared/constants/icon';
import type { GetGoalSummary } from '@web24/shared';
import { useTodayBehaviorAdd } from '@/features/behavior/hooks/useTodayBehaviorAdd';
import { useFilteredTodayBehaviors } from '@/features/behavior/hooks/useFilteredTodayBehaviors';
import { TodayBehaviorAddModal } from '@/features/behavior/components/TodayBehaviorAddModal';
import { SwiperTabs } from './SwiperTabs';

interface BehaviorListProps {
  goals: GetGoalSummary[];
  behaviors: Behavior[];
  onToggle: (id: string) => void;
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  onAddBehavior: (behaviorId: string) => Promise<void>;
}

export function TodayBehaviorList({
  goals,
  behaviors,
  onToggle,
  onRefresh,
  onDelete,
  onAddBehavior,
}: BehaviorListProps) {
  const navigate = useNavigate();
  const { setActiveGoal, goalTabs, filteredBehaviors } = useFilteredTodayBehaviors(
    goals,
    behaviors,
  );
  const {
    isAddOpen,
    openAddModal,
    closeAddModal,
    selectedGoal,
    isLoadingBehaviors,
    goalBehaviors,
    handleGoalSelect,
    handleBehaviorSelect,
    resetGoalSelection,
  } = useTodayBehaviorAdd({ goals, onAddBehavior });

  return (
    <div className="mb-4 flex-col items-center justify-between px-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <span>오늘의 행동</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold">{behaviors.length}</span>
          <span className="group relative inline-flex">
            <button
              type="button"
              aria-label="오늘의 행동 안내"
              aria-describedby="today-behavior-tooltip"
            >
              <Info size={ICON_SIZE.xxs} />
            </button>
            <span
              id="today-behavior-tooltip"
              role="tooltip"
              className="bg-bg-light text-label-normal border-bg-alternative pointer-events-none absolute top-1/2 left-full z-20 ml-2 w-max max-w-[50vw] -translate-y-1/2 rounded-xl border px-3 py-2 text-xs font-medium break-words whitespace-normal opacity-0 shadow-(--shadow-normal) transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100"
            >
              오늘을 위해 추출된 행동만 보여줍니다
            </span>
          </span>
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="text-label-disable hover:text-label-normal inline-flex items-center gap-1 text-sm font-semibold transition"
          >
            <RefreshCw size={ICON_SIZE.xxs} />
            새로고침
          </button>
        )}
      </div>

      {/* 목표 필터 탭 스와이퍼 */}
      <div className="relative mb-2 flex items-center gap-2">
        {/* Tabs */}
        <div className="relative flex-1 overflow-hidden">
          {/* slideOffsetAfter : 슬라이더 맨 오른쪽 여백으로 오른쪽 그라데이션 오버레이의 너비랑 맞춤 */}
          <SwiperTabs tabs={goalTabs} onChange={setActiveGoal} slideOffsetAfter={48} />
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
            onDelete={onDelete ? () => onDelete(behavior.id) : undefined}
          />
        ))}

        {/* 행동 추가 버튼 */}
        <button
          onClick={() => {
            openAddModal();
          }}
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

      <TodayBehaviorAddModal
        isOpen={isAddOpen}
        goals={goals}
        selectedGoal={selectedGoal}
        isLoadingBehaviors={isLoadingBehaviors}
        goalBehaviors={goalBehaviors}
        onClose={closeAddModal}
        onBack={resetGoalSelection}
        onSelectGoal={handleGoalSelect}
        onSelectBehavior={handleBehaviorSelect}
      />
    </div>
  );
}
