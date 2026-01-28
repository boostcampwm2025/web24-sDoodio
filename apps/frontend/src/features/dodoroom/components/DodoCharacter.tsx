import { DODO_ACTIONS, type DodoAction } from '@web24/shared';

const DODO_ACTION_IMAGE_MAP: Record<DodoAction, string> = {
  [DODO_ACTIONS.none]: '/DodoStand.png',
  [DODO_ACTIONS.sitDown]: '/DodoSitdown.png',
  [DODO_ACTIONS.wink]: '/DodoWink.png',
  [DODO_ACTIONS.hurray]: '/DodoHurray.png',
};

interface DodoCharacterProps {
  readonly action: DodoAction;
}

export function DodoCharacter({ action }: DodoCharacterProps) {
  return (
    <img
      src={DODO_ACTION_IMAGE_MAP[action]}
      alt="두두 캐릭터"
      className="h-[60%] max-h-90 w-auto select-none"
    />
  );
}
