import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface InputItemRowProps {
  value: string;
  onChange?: (value: string) => void;
  onDelete?: () => void;
  onAdd?: () => void;
  placeholder: string;
  variant?: 'default' | 'add';
  maxLength?: number;
}

export function InputItemRow({
  value = '',
  onChange,
  onDelete,
  onAdd,
  placeholder = '',
  variant = 'default',
  maxLength,
}: InputItemRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBlurVisible, setIsBlurVisible] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const isOverflowing = input.scrollWidth > input.clientWidth;
    const isAtEnd = input.scrollLeft + input.clientWidth >= input.scrollWidth - 1;
    setIsBlurVisible(isOverflowing && !isAtEnd);
  }, [value]);

  const handleScroll = () => {
    const input = inputRef.current;
    if (!input) return;
    const isOverflowing = input.scrollWidth > input.clientWidth;
    const isAtEnd = input.scrollLeft + input.clientWidth >= input.scrollWidth - 1;
    setIsBlurVisible(isOverflowing && !isAtEnd);
  };

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

  const isMaxLengthReached = maxLength && value.length >= maxLength;

  return (
    <div className="bg-bg-normal group focus-within:ring-primary-weak flex h-16 w-full shrink-0 items-center gap-2 rounded-2xl px-6 transition-all focus-within:ring-2">
      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onScroll={handleScroll}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="text-label-normal placeholder:text-primary-weak md:text-headline-1 h-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal"
        />
        {isBlurVisible && (
          <div className="from-bg-normal pointer-events-none absolute top-0 right-0 h-full w-6 bg-linear-to-l to-transparent" />
        )}
      </div>

      {maxLength && (
        <span
          className={`text-primary-weak shrink-0 text-sm opacity-0 transition-all group-focus-within:opacity-100 ${
            isMaxLengthReached ? 'font-semibold' : ''
          }`}
        >
          {value.length}/{maxLength}
        </span>
      )}

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
