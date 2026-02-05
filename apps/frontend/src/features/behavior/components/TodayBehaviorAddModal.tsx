import { ChevronLeft, X } from 'lucide-react';
import type { Behavior, GetGoalSummary } from '@web24/shared';
import { TodayBehaviorAddContent } from './TodayBehaviorAddContent';

interface TodayBehaviorAddModalProps {
  isOpen: boolean;
  goals: GetGoalSummary[];
  selectedGoal: GetGoalSummary | null;
  isLoadingBehaviors: boolean;
  goalBehaviors: Behavior[];
  onClose: () => void;
  onBack: () => void;
  onSelectGoal: (goalId: string) => void;
  onSelectBehavior: (behaviorId: string) => void;
}

export function TodayBehaviorAddModal({
  isOpen,
  goals,
  selectedGoal,
  isLoadingBehaviors,
  goalBehaviors,
  onClose,
  onBack,
  onSelectGoal,
  onSelectBehavior,
}: TodayBehaviorAddModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center md:justify-center">
      <button
        type="button"
        aria-label="행동 추가 닫기"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <dialog
        open
        aria-modal="true"
        className="bg-bg-light relative z-50 w-full rounded-t-2xl p-4 md:w-[520px] md:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          {/* 뒤로가기 버튼 */}
          {selectedGoal ? (
            <button
              type="button"
              className="text-label-normal inline-flex items-center gap-1 text-sm font-semibold"
              onClick={onBack}
            >
              <ChevronLeft size={16} />
              목표 선택
            </button>
          ) : (
            <h4 className="text-label-normal text-base font-bold">목표 선택</h4>
          )}

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="text-label-alternative hover:text-label-normal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <TodayBehaviorAddContent
            goals={goals}
            selectedGoal={selectedGoal}
            isLoadingBehaviors={isLoadingBehaviors}
            goalBehaviors={goalBehaviors}
            onSelectGoal={onSelectGoal}
            onSelectBehavior={onSelectBehavior}
          />
        </div>
      </dialog>
    </div>
  );
}
