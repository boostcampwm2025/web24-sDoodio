export const BEHAVIOR_DIFFICULTIES = [
  '마음열기',
  '시작하기',
  '이어가기',
  '몰입하기',
  'AI',
] as const;

export type BehaviorDifficulty = (typeof BEHAVIOR_DIFFICULTIES)[number];

export const TODAY_BEHAVIOR_STATUS = ['pending', 'completed', 'skipped', 'ignored'] as const;

export type TodayBehaviorStatus = (typeof TODAY_BEHAVIOR_STATUS)[number];

export const TODAY_BEHAVIOR_ORIGIN = ['user', 'recommendation'] as const;

export type TodayBehaviorOrigin = (typeof TODAY_BEHAVIOR_ORIGIN)[number];
