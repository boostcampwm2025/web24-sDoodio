import { BehaviorDifficulty } from './behavior.types';

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

export interface Goal {
  id: string;
  title: string;
  color: GoalColor;
}

export interface GoalSummary extends Goal {
  behaviorCount: number;
}

export interface GoalStamp {
  id: string;
  difficulty: BehaviorDifficulty;
}
