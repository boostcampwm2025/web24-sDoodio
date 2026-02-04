import { ERROR_MESSAGE_PREFIX } from './some.constants';

export const BEHAVIOR_TITLE_MAX_LENGTH = 30;

export const BEHAVIOR_ERROR_MESSAGES = {
  title_length: `${ERROR_MESSAGE_PREFIX}행동명은 1보다 크고 ${BEHAVIOR_TITLE_MAX_LENGTH}보다 작아야 해.`,
};

export const BEHAVIOR_EXTRACTION_LEVELS = [
  { value: 0.2, label: '적게' },
  { value: 0.4, label: '조금 적게' },
  { value: 0.6, label: '조금 많이' },
  { value: 0.8, label: '많이' },
] as const;

export const DEFAULT_BEHAVIOR_EXTRACTION_RATIO = 0.8;

export const BEHAVIOR_LEVEL_SCORES = {
  마음열기: 1,
  시작하기: 2,
  이어가기: 3,
  몰입하기: 4,
} as const;

export const DEFAULT_BEHAVIOR_WEIGHT = 5;

export type BehaviorExtractionLevel = (typeof BEHAVIOR_EXTRACTION_LEVELS)[number];
