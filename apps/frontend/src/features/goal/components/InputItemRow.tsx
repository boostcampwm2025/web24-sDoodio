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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLeftBlurVisible, setIsLeftBlurVisible] = useState(false);
  const [isRightBlurVisible, setIsRightBlurVisible] = useState(false);

  const updateBlurs = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setIsLeftBlurVisible(scrollLeft > 0);
    setIsRightBlurVisible(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateBlurs();
  }, [value]);

  const handleScroll = () => {
    updateBlurs();
  };

  if (variant === 'add') {
    return (
      <button
        type="button"
        onClick={onAdd}
        aria-label={placeholder}
        className="text-primary-strong hover:bg-bg-alternative bg-bg-normal flex w-full shrink-0 items-center justify-center rounded-2xl px-6 py-4 transition-colors"
      >
        <Plus className="h-6 w-6 stroke-[3px]" />
      </button>
    );
  }

  const isMaxLengthReached = maxLength && value.length >= maxLength;

  return (
    <div className="bg-bg-normal group focus-within:ring-primary-weak flex w-full shrink-0 items-center gap-2 rounded-2xl px-6 py-4 transition-all focus-within:ring-2">
      <div className="relative flex h-full min-w-0 flex-1 items-center">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="no-scrollbar h-full w-full overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="relative flex h-full w-max min-w-full items-center">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onFocus={updateBlurs}
              placeholder={placeholder}
              maxLength={maxLength}
              className="placeholder:text-primary-weak text-label-normal absolute inset-0 h-full w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal md:text-base lg:text-lg"
            />
            <span
              className={`text-body-1 md:text-headline-1 invisible whitespace-pre ${
                value ? 'font-semibold' : 'font-normal'
              }`}
            >
              {value || placeholder}
            </span>
          </div>
        </div>

        {/* Blur overlays */}
        {isLeftBlurVisible && (
          <div className="from-bg-normal pointer-events-none absolute inset-y-0 -left-px z-10 w-6.25 bg-linear-to-r to-transparent" />
        )}
        {isRightBlurVisible && (
          <div className="from-bg-normal pointer-events-none absolute inset-y-0 -right-px z-10 w-6.25 bg-linear-to-l to-transparent" />
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
