import { MAX_STICKERS } from '@/shared/constants/sticker';
import StickerCell from './StickerCell';

export interface StickerBoardProps {
  currentCount: number;
  columns: number;
  onStickerClick: () => void;
}

export function StickerBoard({ currentCount, columns = 5, onStickerClick }: StickerBoardProps) {
  const visibleCount = Math.min(MAX_STICKERS, currentCount + 1);

  return (
    <div
      className="grid w-fit gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: visibleCount }, (_, index) => {
        const isFilled = index < currentCount;
        const isNext = index === currentCount;
        const isClickable = isNext && Boolean(onStickerClick);

        return (
          <StickerCell
            key={`sticker-${index}`}
            isFilled={isFilled}
            isClickable={isClickable}
            onClick={onStickerClick}
          />
        );
      })}
    </div>
  );
}
