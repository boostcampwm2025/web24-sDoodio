export interface BehaviorCategory {
  id: string;
  label: string;
  color: string;
}

export type BehaviorCategoryId = BehaviorCategory['id'];

export const BEHAVIOR_CATEGORIES = [
  { id: 'health', label: '건강', color: '#22c55e' },
  { id: 'study', label: '학습', color: '#3b82f6' },
  { id: 'hobby', label: '취미', color: '#a855f7' },
  { id: 'mind', label: '마음', color: '#f97316' },
  { id: 'relationship', label: '관계', color: '#ec4899' },
  { id: 'life', label: '생활', color: '#6b7280' },
] as const satisfies readonly BehaviorCategory[];

export type DefaultBehaviorCategoryId = (typeof BEHAVIOR_CATEGORIES)[number]['id'];
