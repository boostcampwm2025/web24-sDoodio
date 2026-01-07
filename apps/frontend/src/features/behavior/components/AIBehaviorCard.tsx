import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { BehaviorProps } from '@/shared/components/behavior/BehaviorCard.types';

export function AIBehaviorCard({ behavior, onToggle }: BehaviorProps) {
  return (
    <div className="animate-in fade-in slide-in-from-top-4 border-primary-weak/60 bg-primary-weak/30 relative mb-10 overflow-hidden rounded-4xl border p-6 duration-500">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-label-normal text-lg leading-none font-bold">AI 맞춤 추천</h3>
              <p className="text-label-disable mt-1 text-xs font-medium">
                회원님의 목표 달성을 위해 찾았어요
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BehaviorCard behavior={behavior} onToggle={onToggle} />
        </div>
      </div>
    </div>
  );
}
