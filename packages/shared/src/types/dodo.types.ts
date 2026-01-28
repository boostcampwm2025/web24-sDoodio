export const DODO_ACTIONS = {
  none: 'None',
  sitDown: 'SitDown',
  wink: 'Wink',
  hurray: 'Hurray',
} as const;

export const DODO_ACTION_VALUES = Object.values(DODO_ACTIONS);

export type DodoAction = (typeof DODO_ACTIONS)[keyof typeof DODO_ACTIONS];
