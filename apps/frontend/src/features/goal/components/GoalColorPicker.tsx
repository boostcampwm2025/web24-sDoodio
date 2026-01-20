import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import { GOAL_COLORS, type GoalColor } from '@web24/shared';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface GoalColorPickerProps {
  selectedColor: GoalColor;
  onSelect: (color: GoalColor) => void;
}

export function GoalColorPicker({ selectedColor, onSelect }: GoalColorPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 md:grid-cols-5">
      {GOAL_COLORS.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            className={`group relative flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${GOAL_COLOR_STYLES[color].bg} ${
              isSelected ? `${GOAL_COLOR_STYLES[color].ring} ring-4 ring-offset-2` : ''
            }`}
            aria-label={`Select ${color} color`}
          >
            {isSelected && <Check className="h-6 w-6 stroke-[3px] text-white drop-shadow-sm" />}
            <div
              className={`absolute inset-0 rounded-full transition-opacity group-hover:opacity-20 ${isSelected ? 'opacity-0' : 'bg-black opacity-0'}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function GoalColorPickerPopover({ selectedColor, onSelect }: GoalColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* 현재 색상 원 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`border-primary-strong h-6 w-6 cursor-pointer rounded-full border-2 ${GOAL_COLOR_STYLES[selectedColor].bg}`}
        aria-label="목표 색상 변경"
      />

      {/* 팝업 */}
      {open && (
        <div className="bg-bg-light absolute top-12 right-0 z-30 w-56 rounded-xl border shadow-xl md:w-90">
          <GoalColorPicker
            selectedColor={selectedColor}
            onSelect={(color) => {
              onSelect(color);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
