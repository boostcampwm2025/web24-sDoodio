import { type DodoAction } from '@web24/shared';
import { DODO_ACTION_IMAGE_MAP } from '../constants/dodo-action';

interface DodoCharacterProps {
  readonly action: DodoAction;
}

export function DodoCharacter({ action }: DodoCharacterProps) {
  return (
    <img
      src={DODO_ACTION_IMAGE_MAP[action].src}
      alt={DODO_ACTION_IMAGE_MAP[action].alt}
      className="h-[60%] max-h-90 w-auto select-none"
    />
  );
}
