import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { ICON_SIZE } from '@/shared/constants/icon';

interface AIBehaviorContainerProps {
  behaviors: Behavior[];
  onToggle: (id: string) => void;
  isLoading: boolean;
  isMaking: boolean;
}

function MakingIndicator() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-5">
      <img src="/DodoFace.png" alt="두두 얼굴" width={ICON_SIZE['3xl']} />
      <p>두두가 주머니를 뒤지는 중...</p>
    </div>
  );
}

export function AIBehaviorContainer({
  behaviors,
  onToggle,
  isLoading = true,
  isMaking = false,
}: AIBehaviorContainerProps) {
  const containerClassName =
    'animate-in fade-in slide-in-from-top-4 border-primary-weak/60 bg-primary-weak/30 relative mb-10 overflow-hidden rounded-4xl border p-6 duration-500 min-h-55';

  if ((behaviors.length === 0 || isLoading) && !isMaking) {
    return <div className={containerClassName} />;
  }

  return (
    <div className={containerClassName}>
      {isMaking ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <MakingIndicator />
        </div>
      ) : (
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
            {behaviors.map((behavior) => (
              <BehaviorCard
                key={behavior.id}
                behavior={behavior}
                onToggle={() => onToggle(behavior.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
