import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface StickerCellProps {
  isFilled: boolean;
  isClickable: boolean;
  onClick: () => void;

  ariaLabel?: string;
  ariaPressed?: boolean;

  stickerColor: string;
}

function StickerCell({
  isFilled,
  isClickable,
  onClick,
  ariaLabel,
  ariaPressed,
  stickerColor,
}: StickerCellProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isFilled) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [isFilled]);

  const filledClasses = `${stickerColor} text-bg-light`;
  const emptyClasses = 'scale-95 border-2 bg-transparent text-transparent sticker-empty-border';
  const cellClasses = [
    'animate-fade-in flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all duration-400',
    isFilled ? filledClasses : emptyClasses,
    isClickable ? 'cursor-pointer hover:scale-100 active:scale-95' : 'cursor-default',
  ].join(' ');

  const token = stickerColor.startsWith('bg-') ? stickerColor.slice(3) : stickerColor;
  const stickerBorderStyle = {
    ['--sticker-color' as any]: `var(--color-${token}, var(--color-primary-normal))`,
  };
  const transformStyle = {
    transform: isAnimating ? 'rotate(12deg) scale(1.25)' : 'rotate(-5deg) scale(1)',
    transition: 'transform 0.4s ease-out',
  };

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={isClickable ? onClick : undefined}
      aria-label={ariaLabel ?? (isFilled ? '완료 스티커' : '빈 스티커 칸')}
      aria-pressed={ariaPressed}
      className={cellClasses}
      style={{ ...stickerBorderStyle, ...transformStyle }}
    >
      {isFilled && <Star />}
    </button>
  );
}

StickerCell.defaultProps = {
  ariaLabel: undefined,
  ariaPressed: undefined,
};

export default StickerCell;
