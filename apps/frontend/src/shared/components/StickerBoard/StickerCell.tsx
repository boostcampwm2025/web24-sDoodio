import Star from '@/shared/components/Star';
import { useEffect, useState } from 'react';

interface StickerCellProps {
  isFilled: boolean;
  isClickable: boolean;
  onClick: () => void;
  isNewlyFilled: boolean;
}

function StickerCell({ isFilled, isClickable, onClick, isNewlyFilled }: StickerCellProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isNewlyFilled) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [isNewlyFilled]);

  const filledClasses = isAnimating
    ? 'rotate-12 scale-125 bg-zinc-700 text-yellow-400'
    : 'rotate-[-5deg] scale-100 bg-zinc-700 text-yellow-400';

  const cellClasses = [
    'animate-fade-in flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all',
    isFilled
      ? filledClasses
      : 'scale-95 border border-dashed border-zinc-300 bg-transparent text-transparent hover:border-zinc-400',
    isClickable
      ? 'cursor-pointer hover:scale-100 hover:bg-zinc-50 active:scale-95'
      : 'cursor-default',
  ].join(' ');

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={isClickable ? onClick : undefined}
      aria-label={isFilled ? '완료 스티커' : '빈 스티커 칸'}
      className={cellClasses}
    >
      {isFilled && <Star />}
    </button>
  );
}

export default StickerCell;
