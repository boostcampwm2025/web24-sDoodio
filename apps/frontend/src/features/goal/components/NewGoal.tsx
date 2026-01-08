import type { GoalColor } from '@web24/shared';
import { InputItemRow } from './InputItemRow';
import { GoalColorPicker } from './GoalColorPicker';

interface NewGoalProps {
  title: string;
  setTitle: (title: string) => void;
  color: GoalColor;
  setColor: (color: GoalColor) => void;
}

export function NewGoal({ title, setTitle, color, setColor }: NewGoalProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-5">
      <p className="text-heading-2 font-semibold">목표 이름</p>
      <InputItemRow value={title} onChange={setTitle} placeholder="목표 이름을 입력해주세요" />
      <p className="text-heading-2 font-semibold">목표 색상</p>
      <GoalColorPicker selectedColor={color} onSelect={setColor} />
    </div>
  );
}
