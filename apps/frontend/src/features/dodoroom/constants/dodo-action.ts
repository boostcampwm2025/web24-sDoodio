import { DODO_ACTIONS, type DodoAction } from '@web24/shared';

export const DODO_ACTION_IMAGE_MAP: Record<
  DodoAction,
  {
    src: string;
    alt: string;
  }
> = {
  [DODO_ACTIONS.none]: { src: '/DodoStand.webp', alt: '서있는 두두' },
  [DODO_ACTIONS.sitDown]: { src: '/DodoSitdown.webp', alt: '앉은 두두' },
  [DODO_ACTIONS.wink]: { src: '/DodoWink.webp', alt: '윙크하는 두두' },
  [DODO_ACTIONS.hurray]: { src: '/DodoHurray.webp', alt: '만세하는 두두' },
};

export const DODO_ACTION_COMMAND_MAP: Record<Exclude<DodoAction, 'None'>, string> = {
  [DODO_ACTIONS.sitDown]: '두두야, 앉아!',
  [DODO_ACTIONS.wink]: '두두야, 윙크해!',
  [DODO_ACTIONS.hurray]: '두두야, 만세해!',
};
