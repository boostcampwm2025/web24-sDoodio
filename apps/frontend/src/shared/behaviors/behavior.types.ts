import type { BehaviorCategoryId } from './behaviorCategory';
import type { Weekday } from './weekdays';

export type { BehaviorCategory, BehaviorCategoryId } from './behaviorCategory';
export type { Weekday } from './weekdays';

export interface BehaviorItem {
  id: string;
  title: string;
  description: string;
  categoryId: BehaviorCategoryId;
  weekdays: Weekday[];
  isAiRecommended: boolean;
  totalCompletions: number;
  createdAt: number;
}

export interface TodayBehaviorItem {
  behaviorId: string;
  done: boolean;
}