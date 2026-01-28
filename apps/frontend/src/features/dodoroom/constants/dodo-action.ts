import { DODO_ACTIONS, type DodoAction } from '@web24/shared';

export const DODO_ACTION_IMAGE_MAP: Record<DodoAction, string> = {
  [DODO_ACTIONS.none]: '/DodoStand.png',
  [DODO_ACTIONS.sitDown]: '/DodoSitdown.png',
  [DODO_ACTIONS.wink]: '/DodoWink.png',
  [DODO_ACTIONS.hurray]: '/DodoHurray.png',
};

export const DODO_ACTION_COMMAND_MAP: Record<Exclude<DodoAction, 'None'>, string> = {
  [DODO_ACTIONS.sitDown]: '두두야, 앉아!',
  [DODO_ACTIONS.wink]: '두두야, 윙크해!',
  [DODO_ACTIONS.hurray]: '두두야, 만세해!',
};
