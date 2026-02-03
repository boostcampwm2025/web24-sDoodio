import { DODO_ACTION_IMAGE_MAP } from '@/features/dodoroom/constants/dodo-action';
import type { DodoAction } from '@web24/shared';

interface DodoActionButtonProps {
  readonly action: Exclude<DodoAction, 'None'>;
  readonly onClick: (action: Exclude<DodoAction, 'None'>) => void;
  readonly disabled: boolean;
}

export function DodoActionButton({ action, onClick, disabled }: DodoActionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(action)}
      className={`flex h-12 w-12 items-center justify-center rounded-md p-1 transition ${
        disabled ? 'cursor-not-allowed bg-white/60 opacity-70' : 'bg-white/80 hover:bg-white'
      } `}
    >
      <img
        className="h-full w-full object-contain select-none"
        src={DODO_ACTION_IMAGE_MAP[action].src}
        alt={DODO_ACTION_IMAGE_MAP[action].alt}
        draggable={false}
      />
    </button>
  );
}
