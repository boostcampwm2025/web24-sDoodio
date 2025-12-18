import Star from '@/shared/components/Star';

interface StickerCellProps {
  isFilled: boolean;
  isClickable: boolean;
  onClick: () => void;
}

function StickerCell({ isFilled, isClickable, onClick }: StickerCellProps) {
  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={isClickable ? onClick : undefined}
      aria-label={isFilled ? '완료 스티커' : '빈 스티커 칸'}
      className={[
        'animate-fade-in flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all',
        isFilled
          ? 'scale-100 bg-zinc-700 text-yellow-400'
          : 'scale-95 border border-dashed border-zinc-300 bg-transparent text-transparent hover:border-zinc-400',
        isClickable
          ? 'cursor-pointer hover:scale-100 hover:bg-zinc-50 active:scale-95'
          : 'cursor-default',
      ].join(' ')}
    >
      {isFilled && <Star />}
    </button>
  );
}

export default StickerCell;
