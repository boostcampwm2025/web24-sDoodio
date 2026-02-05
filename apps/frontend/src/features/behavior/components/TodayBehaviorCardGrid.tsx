import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { Plus } from 'lucide-react';

interface TodayBehaviorCardGridProps {
  behaviors: Behavior[];
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  openAddModal: () => void;
}

export function TodayBehaviorCardGrid({
  behaviors,
  onToggle,
  onDelete,
  openAddModal,
}: TodayBehaviorCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {behaviors.map((behavior: Behavior) => (
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
  );
}
