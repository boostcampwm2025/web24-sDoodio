import { CheckCircle2 } from 'lucide-react';
import type { BehaviorProps, Difficulty } from './BehaviorCard.types';

function DifficultyBadge({ level }: { level: Difficulty }) {
  const styles = {
    마음열기: 'bg-difficulty-1 text-bg-light',
    시작하기: 'bg-difficulty-2 text-bg-light',
    이어가기: 'bg-difficulty-3 text-bg-light',
    몰입하기: 'bg-difficulty-4 text-bg-light',
  };
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[level]} border border-current/10`}
    >
      {level}
    </span>
  );
}

export function BehaviorCard({ behavior, onToggle }: BehaviorProps) {
  return (
    <div
      className={`group bg-bg-light relative flex cursor-pointer items-center gap-4 rounded-2xl px-7 py-5 transition-all duration-500 ${
        behavior.isChecked
          ? 'border-bg-alternative bg-bg-light scale-[0.99] opacity-60 shadow-none saturate-50'
          : 'border-transparent shadow-[var(--shadow-normal)] hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]'
      } `}
      onClick={onToggle}
      role="presentation"
    >
      {/* 왼쪽 컬러 바 */}
      <div className={`absolute top-0 bottom-0 left-0 w-3.5 rounded-l-2xl ${behavior.goalColor}`} />

      <div className="flex-1 pl-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="bg-bg-alternative text-label-disable rounded px-2 py-0.5 text-xs font-bold">
            {behavior.goalTitle}
          </span>
        </div>
        <h4
          className={`text-base font-bold transition-all duration-300 ${
            behavior.isChecked ? 'text-label-disable line-through' : 'text-label-normal'
          }`}
        >
          {behavior.title}
        </h4>
        <div className="mt-2 flex gap-2">
          <DifficultyBadge level={behavior.difficulty} />
        </div>
      </div>

      {/* 토글 버튼 */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          behavior.isChecked
            ? `${behavior.goalColor} text-bg-light border-transparent` // 완료됨: 목표 색상 배경
            : 'border-primary-weak text-primary-normal group-hover:border-primary-strong group-hover:text-primary-strong' // 미완료
        } `}
      >
        <CheckCircle2 size={20} strokeWidth={3} />
      </div>
    </div>
  );
}
