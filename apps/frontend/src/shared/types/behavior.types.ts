import type { BehaviorCategoryId } from '../constants/behaviorCategory';
import type { Weekday } from '../constants/weekdays';

export type { BehaviorCategory, BehaviorCategoryId } from '../constants/behaviorCategory';
export type { Weekday } from '../constants/weekdays';

export interface BehaviorItem {
  id: string;
  title: string;
  description: string;
  identityStatement: string;
  categoryId: BehaviorCategoryId;
  weekdays: Weekday[];
  isAiRecommended: boolean;
  isRandomRecommended: boolean;
  totalCompletions: number;
  createdAt: number;
}

export interface TodayBehaviorItem {
  behaviorId: string;
  done: boolean;
}

export interface DodoPreset {
  categoryId: BehaviorCategoryId;
  line: string;
  actionText: string;
}
