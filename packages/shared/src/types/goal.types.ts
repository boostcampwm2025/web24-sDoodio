export const GOAL_COLORS = [
  'LightPink',
  'Pink',
  'Yellow',
  'Sand',
  'Mint',
  'Blue',
  'GrayMint',
  'WarmGray',
  'Beige',
  'Lavender',
] as const;

export type GoalColor = (typeof GOAL_COLORS)[number];
