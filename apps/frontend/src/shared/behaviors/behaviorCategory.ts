export const BEHAVIOR_CATEGORIES = [
  { id: 'health', label: '건강' },
  { id: 'study', label: '학습' },
  { id: 'hobby', label: '취미' },
  { id: 'mind', label: '마음' },
  { id: 'relationship', label: '관계' },
  { id: 'life', label: '생활' },
] as const;

export type BehaviorCategoryId = (typeof BEHAVIOR_CATEGORIES)[number]['id'];
export type BehaviorCategory = (typeof BEHAVIOR_CATEGORIES)[number];
