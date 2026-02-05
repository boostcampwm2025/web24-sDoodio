import { GOAL_TITLE_MAX_LENGTH, type GoalColor } from '@web24/shared';
import { Palette, Tag } from 'lucide-react';
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
    <div className="flex h-full w-full flex-col gap-5">
      <div className="text-primary-strong flex items-center gap-2 px-1">
        <Tag className="h-4 w-4" />
        <span className="text-sm font-bold tracking-tight uppercase">목표 이름</span>
      </div>
      <InputItemRow
        value={title}
        onChange={setTitle}
        placeholder="목표 이름을 입력해주세요"
        maxLength={GOAL_TITLE_MAX_LENGTH}
      />
      <div className="text-primary-strong flex items-center gap-2 px-1">
        <Palette className="h-4 w-4" />
        <span className="text-sm font-bold tracking-tight uppercase">목표 색상</span>
      </div>
      <GoalColorPicker selectedColor={color} onSelect={setColor} />
    </div>
  );
}
