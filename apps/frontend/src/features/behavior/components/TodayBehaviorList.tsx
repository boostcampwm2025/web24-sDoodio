import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { Plus, Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ICON_SIZE } from '@/shared/constants/icon';
import type { GetGoalSummary } from '@web24/shared';
import { useTodayBehaviorAdd } from '@/features/behavior/hooks/useTodayBehaviorAdd';
import { useFilteredTodayBehaviors } from '@/features/behavior/hooks/useFilteredTodayBehaviors';
import { TodayBehaviorAddModal } from '@/features/behavior/components/TodayBehaviorAddModal';
import { EmptyGoal } from '@/shared/components/goal/EmptyGoal';
import { useState } from 'react';
import { SwiperTabs } from './SwiperTabs';
import { TodayBehaviorCardGrid } from './TodayBehaviorCardGrid';

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
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mb-4 flex-col items-center justify-between px-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <span>오늘의 행동</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold">{behaviors.length}</span>
          <span className="relative inline-flex">
            <button
              type="button"
              aria-label="오늘의 행동 안내"
              aria-describedby="today-behavior-tooltip"
              aria-expanded={showTooltip}
              // 데스크톱: 마우스 올리면 보이고, 떼면 숨김
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              // 모바일 & 데스크톱: 클릭(터치) 시 토글
              onClick={() => setShowTooltip((prev) => !prev)}
            >
              <Info size={ICON_SIZE.xxs} />
            </button>

            <span
              id="today-behavior-tooltip"
              role="tooltip"
              className={`bg-bg-light text-label-normal border-bg-alternative pointer-events-none absolute top-1/2 left-full z-20 ml-2 w-max max-w-[50vw] -translate-y-1/2 rounded-xl border px-3 py-2 text-xs font-medium wrap-break-word whitespace-normal shadow-(--shadow-normal) transition-opacity duration-200 ${showTooltip ? 'visible opacity-100' : 'invisible opacity-0'} `}
            >
              오늘을 위해 추출된 행동만 보여줍니다
            </span>
          </span>
        </h3>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="text-label-disable hover:text-label-normal hover:bg-primary-weak/30 inline-flex items-center gap-1 rounded-lg text-sm font-semibold transition"
          >
            <RefreshCw size={ICON_SIZE.xxs} />
            오늘의 행동 다시 뽑기
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

      {/* 목표가 없으면 목표 추가 표시 있으면 해당하는 행동 카드 표시 */}
      {goals.length === 0 ? (
        <EmptyGoal />
      ) : (
        <TodayBehaviorCardGrid
          behaviors={filteredBehaviors}
          onToggle={onToggle}
          onDelete={onDelete}
          openAddModal={openAddModal}
        />
      )}

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
