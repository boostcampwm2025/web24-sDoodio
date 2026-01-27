import { Minus, Plus } from 'lucide-react';

interface InputItemRowProps {
  value: string;
  onChange?: (value: string) => void;
  onDelete?: () => void;
  onAdd?: () => void;
  placeholder: string;
  variant?: 'default' | 'add';
}

export function InputItemRow({
  value = '',
  onChange,
  onDelete,
  onAdd,
  placeholder = '',
  variant = 'default',
}: InputItemRowProps) {
  if (variant === 'add') {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="text-primary-strong hover:bg-bg-alternative bg-bg-normal flex h-16 w-full shrink-0 items-center justify-center rounded-2xl transition-colors"
      >
        <Plus className="h-6 w-6 stroke-[3px]" />
      </button>
    );
  }

  return (
    <div className="bg-bg-normal focus-within:ring-primary-weak flex h-16 w-full shrink-0 items-center gap-2 rounded-2xl px-6 transition-all focus-within:ring-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="text-headline-1 text-label-normal placeholder:text-primary-weak h-full min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal"
      />
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-primary-weak hover:text-label-disable shrink-0 transition-colors"
          aria-label="지우기"
        >
          <Minus className="h-6 w-6 stroke-[3px]" />
        </button>
      )}
    </div>
  );
}
