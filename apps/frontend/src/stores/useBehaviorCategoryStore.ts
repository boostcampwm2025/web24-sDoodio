import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { BEHAVIOR_CATEGORIES } from '@/shared/constants/behaviorCategory';
import type { BehaviorCategory } from '@/shared/constants/behaviorCategory';

interface CreateCategoryInput {
  label: string;
  color: string;
}

interface BehaviorCategoryState {
  items: BehaviorCategory[];
  add: (input: CreateCategoryInput) => BehaviorCategory;
  update: (id: string, patch: Partial<Pick<BehaviorCategory, 'label' | 'color'>>) => void;
  clear: () => void;
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeLabel(label: string) {
  return label.trim().replace(/\s+/g, ' ');
}

function normalizeColor(color: string) {
  return color.trim() || '#6366f1';
}

const DEFAULTS: BehaviorCategory[] = BEHAVIOR_CATEGORIES.map((c) => ({ ...c }));

export const useBehaviorCategoryStore = create<BehaviorCategoryState>()(
  persist(
    (set) => ({
      items: DEFAULTS,

      add: ({ label, color }) => {
        const normalized = normalizeLabel(label);
        if (!normalized) throw new Error('카테고리 이름이 필요합니다.');

        const next: BehaviorCategory = {
          id: createId(),
          label: normalized,
          color: normalizeColor(color),
        };

        set((state) => ({ items: [next, ...state.items] }));
        return next;
      },

      update: (id, patch) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const normalizedLabel =
              patch.label === undefined ? undefined : normalizeLabel(patch.label);
            const nextLabel =
              normalizedLabel === undefined || normalizedLabel === ''
                ? item.label
                : normalizedLabel;
            const nextColor = patch.color === undefined ? item.color : normalizeColor(patch.color);
            return { ...item, label: nextLabel, color: nextColor };
          }),
        }));
      },

      clear: () => set({ items: DEFAULTS }),
    }),
    {
      name: 'web24.behaviorCategories',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
