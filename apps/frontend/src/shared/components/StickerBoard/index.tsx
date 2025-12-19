import { MAX_STICKERS } from '@/shared/constants/sticker';
import { useState, useEffect } from 'react';
import StickerCell from './StickerCell';

export interface StickerBoardProps {
  currentCount: number;
  columns: number;
  onStickerClick: () => void;
}

export function StickerBoard({ currentCount, columns = 5, onStickerClick }: StickerBoardProps) {
  const visibleCount = Math.min(MAX_STICKERS, currentCount + 1);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  const handleStickerClick = () => {
    setLastClickedIndex(currentCount);
    onStickerClick();
  };

  useEffect(() => {
    if (lastClickedIndex !== null) {
      const timer = setTimeout(() => {
        setLastClickedIndex(null);
      }, 500);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [lastClickedIndex]);

  return (
    <div
      className="grid w-fit gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: visibleCount }, (_, index) => {
        const isFilled = index < currentCount;
        const isNext = index === currentCount;
        const isClickable = isNext && Boolean(handleStickerClick);

        return (
          <StickerCell
            key={`sticker-${index}`}
            isFilled={isFilled}
            isClickable={isClickable}
            onClick={handleStickerClick}
            isNewlyFilled={index === lastClickedIndex}
          />
        );
      })}
    </div>
  );
}
