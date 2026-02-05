import type { BehaviorDifficulty, GoalColor } from '@web24/shared';

export interface Behavior {
  id: string;
  title: string;
  goalTitle: string;
  goalColor: GoalColor;
  goalTemplateId?: string;
  isChecked: boolean;
  difficulty: BehaviorDifficulty;
  isRecommended: boolean;
}
