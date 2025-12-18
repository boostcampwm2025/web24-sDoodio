import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TodayBehaviorItem } from '@/shared/types/behavior.types';
import { getLocalDateKey, getLocalWeekday } from '@/utils/date.utils';
import { pickRandomUnique } from '@/utils/random.utils';

import { useBehaviorPoolStore } from './useBehaviorPoolStore';

interface DrawOptions {
  randomNumberGenerator?: () => number;
  now?: Date;
}

interface TodayBehaviorState {
  dateKey: string;
  items: TodayBehaviorItem[];
  ensureToday: (now?: Date) => void;
  setFromPool: (behaviorIds: string[], now?: Date) => void;
  addFromPool: (behaviorIds: string[], now?: Date) => void;
  drawRandomFromPool: (count: number, options?: DrawOptions) => void;
  incrementCount: (behaviorId: string) => void;
  clear: (now?: Date) => void;
}

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values)];
}

export const useTodayBehaviorStore = create<TodayBehaviorState>()(
  persist(
    (set, get) => ({
      dateKey: getLocalDateKey(), // 오늘 행동 목록이 어느 날짜 기준인지 표시
      items: [],

      /**
       * 하루가 지나 날짜가 바뀌면 오늘 행동 목록을 비움
       * @param now 오늘 날짜
       */
      ensureToday: (now) => {
        const nextKey = getLocalDateKey(now);
        if (get().dateKey === nextKey) return;
        set({ dateKey: nextKey, items: [] });
      },

      /**
       * 행동 풀에서 행동 아이템들을 지정해서 오늘 행동 목록에 추가
       * @param behaviorIds 행동 풀에서 가져올 행동의 Id들
       * @param now 오늘 날짜
       */
      setFromPool: (behaviorIds, now) => {
        get().ensureToday(now);
        const poolIds = new Set(useBehaviorPoolStore.getState().items.map((b) => b.id));
        const next = uniqueStrings(behaviorIds)
          .filter((id) => poolIds.has(id))
          .map<TodayBehaviorItem>((behaviorId) => ({ behaviorId, currentCount: 0 }));
        set({ items: next });
      },

      /**
       * 행동 풀에서 행동 아이템들을 오늘 행동 목록에 "추가" (기존 유지 + 중복 방지)
       * @param behaviorIds 행동 풀에서 가져올 행동의 Id들
       * @param now 오늘 날짜
       */
      addFromPool: (behaviorIds, now) => {
        get().ensureToday(now);
        const poolIds = new Set(useBehaviorPoolStore.getState().items.map((b) => b.id));
        const toAdd = uniqueStrings(behaviorIds).filter((id) => poolIds.has(id));

        const existing = get().items;
        const existingIds = new Set(existing.map((item) => item.behaviorId));
        const merged = [...existing];

        toAdd.forEach((behaviorId) => {
          if (!existingIds.has(behaviorId)) merged.push({ behaviorId, currentCount: 0 });
        });

        set({ items: merged });
      },

      /**
       * 행동 풀에서 랜덤으로 뽑아 오늘 행동 목록을 설정
       * @param count 뽑아올 행동 아이템 수
       * @param options
       */
      drawRandomFromPool: (count, options) => {
        const { randomNumberGenerator, now } = options ?? {};
        get().ensureToday(now);

        const weekday = getLocalWeekday(now);
        const pool = useBehaviorPoolStore
          .getState()
          .items.filter(
            (b) =>
              b.isRandomRecommended && (b.weekdays.length === 0 || b.weekdays.includes(weekday)),
          );
        const ids = pool.map((b) => b.id);
        const picked = pickRandomUnique(ids, count, randomNumberGenerator ?? Math.random);
        set({ items: picked.map((behaviorId) => ({ behaviorId, currentCount: 0 })) });
      },

      incrementCount: (behaviorId) => {
        const current = get().items.find((item) => item.behaviorId === behaviorId);
        if (!current) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.behaviorId === behaviorId
              ? { ...item, currentCount: item.currentCount + 1 }
              : item,
          ),
        }));

        useBehaviorPoolStore.getState().adjustTotalCompletions(behaviorId, 1);
      },

      clear: (now) => {
        get().ensureToday(now);
        set({ items: [] });
      },
    }),
    {
      name: 'web24.todayBehaviors',
      storage: createJSONStorage(() => localStorage),
      version: 2, // Version bump for schema change
    },
  ),
);
