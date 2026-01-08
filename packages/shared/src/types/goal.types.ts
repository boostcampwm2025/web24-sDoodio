export const GOAL_COLORS = [
  'light-pink',
  'pink',
  'yellow',
  'sand',
  'mint',
  'blue',
  'gray-mint',
  'warm-gray',
  'beige',
  'lavender',
] as const;

export type GoalColor = (typeof GOAL_COLORS)[number];
