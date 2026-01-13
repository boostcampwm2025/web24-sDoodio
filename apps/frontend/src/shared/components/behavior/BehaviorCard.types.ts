import type { BehaviorDifficulty, GoalColor } from '@web24/shared';

export interface Behavior {
  id: string;
  title: string;
  goalTitle: string;
  goalColor: GoalColor;
  isChecked: boolean;
  difficulty: BehaviorDifficulty;
  isRecommended: boolean;
}
