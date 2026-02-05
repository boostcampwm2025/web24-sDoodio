import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import type { GoalSummary, Behavior } from '@web24/shared';
import { ChevronsUp, ChevronsDown, Trash2 } from 'lucide-react';
import { ICON_SIZE } from '@/shared/constants/icon';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';
import { toast } from 'react-toastify';
import { useGoalBehaviorsQuery } from '../hooks/useGoalBehaviorsQuery';

interface GoalCardProps {
  goal: GoalSummary;
  behaviors?: Behavior[];
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: (goalId: string) => void;
}

export function GoalCard({
  goal,
  behaviors: propsBehaviors,
  isOpen,
  onToggle,
  onNavigate,
}: GoalCardProps) {
  const { data: fetchedBehaviors } = useGoalBehaviorsQuery(goal.id, isOpen);
  const behaviors =
    fetchedBehaviors && fetchedBehaviors.length > 0 ? fetchedBehaviors : propsBehaviors || [];

  return (
    <div
      className={`relative mb-4 flex break-inside-avoid flex-col rounded-3xl px-7 py-5 transition-all duration-500 ${GOAL_COLOR_STYLES[goal.color].bg} shadow-sm`}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={() => onNavigate?.(goal.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onNavigate?.(goal.id);
          }
        }}
      >
        {/* 카드 헤더 */}
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-heading-1 font-bold">{goal.title}</h3>
            <span>{goal.behaviorCount}개의 행동</span>
          </div>
          {/* 삭제 기능 추가 필요 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toast('구현 예정입니다.');
            }}
          >
            <Trash2 size={ICON_SIZE.sm} />
          </button>
        </div>
        {/* 카드 바디 */}
        <div
          className={`scrollbar-pretty transition-all duration-500 ease-in-out md:overflow-hidden md:overflow-y-auto ${isOpen ? 'py-6 opacity-100 md:max-h-250' : 'max-h-0 opacity-0'} `}
        >
          <div className="flex flex-col items-center gap-4">
            {behaviors?.map((behavior) => (
              <div
                key={behavior.id}
                className="bg-bg-alternative flex w-full flex-row items-center justify-between gap-3 rounded-xl p-3 shadow-md"
              >
                <p className="text-headline-2 font-semibold">{behavior.title}</p>
                <DifficultyBadge level={behavior.difficulty} />
              </div>
            ))}
            {(!behaviors || behaviors.length === 0) && (
              <div className="bg-bg-alternative/60 text-label-disable flex w-full flex-row items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 py-4 text-center text-sm">
                <img
                  src="/DodoFace.png"
                  alt="두두 놀란 얼굴"
                  height={ICON_SIZE['2xl']}
                  width={ICON_SIZE['2xl']}
                />
                <p>등록된 행동이 안보여요</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 펼치기/접기 버튼 */}
      <div className="mt-3 border-t border-white/30 pt-2">
        <button
          aria-label={isOpen ? '접기' : '펼치기'}
          type="button"
          className="flex w-full justify-center opacity-80 transition-transform hover:animate-bounce hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isOpen ? <ChevronsUp size={ICON_SIZE.md} /> : <ChevronsDown size={ICON_SIZE.md} />}
        </button>
      </div>
    </div>
  );
}
