import type { GoalColor } from '@web24/shared';

export type Difficulty = '마음열기' | '시작하기' | '이어가기' | '몰입하기';

export interface Behavior {
  id: string;
  title: string;
  goalTitle: string;
  goalColor: GoalColor;
  isChecked: boolean;
  difficulty: Difficulty;
  isRecommended: boolean;
}
