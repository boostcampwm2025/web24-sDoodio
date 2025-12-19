import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BehaviorCategoryId, BehaviorItem, Weekday } from '@/shared/types/behavior.types';
import { BEHAVIOR_CATEGORIES } from '@/shared/constants/behaviorCategory';
import { WEEKDAYS } from '@/shared/constants/weekdays';

interface CreateBehaviorInput {
  title: string;
  description?: string;
  identityStatement?: string;
  categoryId: BehaviorCategoryId;
  weekdays?: readonly Weekday[];
  isAiRecommended?: boolean;
  isRandomRecommended?: boolean;
}

interface BehaviorPoolState {
  items: BehaviorItem[];
  add: (input: CreateBehaviorInput) => BehaviorItem;
  remove: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  adjustTotalCompletions: (id: string, delta: number) => void;
  clear: () => void;
  seedDefaultsIfEmpty: () => void;
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, ' ');
}

function normalizeDescription(description: string | undefined) {
  return (description ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeIdentityStatement(identityStatement: string | undefined) {
  return (identityStatement ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeWeekdays(weekdays: readonly Weekday[] | undefined) {
  if (!weekdays) return [...WEEKDAYS];
  return [...new Set(weekdays)];
}

export const useBehaviorPoolStore = create<BehaviorPoolState>()(
  persist(
    (set, get) => ({
      items: [],

      add: ({
        title,
        description,
        identityStatement,
        categoryId,
        weekdays,
        isAiRecommended,
        isRandomRecommended,
      }) => {
        const normalized = normalizeTitle(title);
        if (!normalized) throw new Error('행동 제목이 필요합니다.');

        const next: BehaviorItem = {
          id: createId(),
          title: normalized,
          description: normalizeDescription(description),
          identityStatement: normalizeIdentityStatement(identityStatement),
          categoryId,
          weekdays: normalizeWeekdays(weekdays),
          isAiRecommended: isAiRecommended ?? false,
          isRandomRecommended: isRandomRecommended ?? false,
          totalCompletions: 0,
          createdAt: Date.now(),
        };

        set((state) => ({ items: [next, ...state.items] }));
        return next;
      },

      remove: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      updateTitle: (id, title) => {
        const normalized = normalizeTitle(title);
        if (!normalized) throw new Error('행동 제목이 필요합니다.');

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, title: normalized } : item,
          ),
        }));
      },

      /**
       * 행동 아이템의 누적 수행 횟수를 delta만큼 증감
       * @param id 행동 아이템 id
       * @param delta 증감하고 싶은 수행 횟수
       */
      adjustTotalCompletions: (id, delta) => {
        if (!Number.isFinite(delta) || delta === 0) return;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const next = Math.max(0, item.totalCompletions + delta);
            return next === item.totalCompletions ? item : { ...item, totalCompletions: next };
          }),
        }));
      },

      clear: () => {
        set({ items: [] });
      },

      /**
       * 풀이 비어있을 떄 기본 행동 아이템을 넣음 (행동 추가 기능 구현 이전 테스트용)
       */
      seedDefaultsIfEmpty: () => {
        const { items } = get();
        if (items.length > 0) return;

        const seeded: BehaviorItem[] = BEHAVIOR_CATEGORIES.map((category) => ({
          id: createId(),
          title: `${category.label} 기본 행동`,
          description: '',
          identityStatement: '',
          categoryId: category.id,
          weekdays: [...WEEKDAYS],
          isAiRecommended: false,
          isRandomRecommended: true,
          totalCompletions: 0,
          createdAt: Date.now(),
        }));

        set({ items: seeded });
      },
    }),
    {
      name: 'web24.behaviorPool',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { items?: unknown };
        const items = Array.isArray(state.items) ? state.items : [];

        return {
          ...state,
          items: items.map((item) => {
            if (!item || typeof item !== 'object') return item;
            if ('identityStatement' in item) return item;
            return { ...(item as object), identityStatement: '' };
          }),
        };
      },
    },
  ),
);
