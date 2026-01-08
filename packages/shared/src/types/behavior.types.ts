export const BEHAVIOR_DIFFICULTIES = [
  '마음열기',
  '시작하기',
  '이어하기',
  '몰입하기',
  'AI',
] as const;

export type BehaviorDifficulty = (typeof BEHAVIOR_DIFFICULTIES)[number];
