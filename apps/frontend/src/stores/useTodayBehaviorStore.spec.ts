import { beforeEach, describe, expect, it } from 'vitest';

import { createSeededRng } from '@/utils/random.utils';

import { useBehaviorPoolStore } from './useBehaviorPoolStore';
import { useTodayBehaviorStore } from './useTodayBehaviorStore';

describe('useTodayBehaviorStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useBehaviorPoolStore.setState({ items: [] });
    useTodayBehaviorStore.setState({ dateKey: '2025-01-01', items: [] });
  });

  it('행동 풀로부터 행동 아이템 랜덤 추출', () => {
    useBehaviorPoolStore.getState().add({ title: '스트레칭', categoryId: 'health' });
    useBehaviorPoolStore.getState().add({ title: '영단어 10개', categoryId: 'study' });
    useBehaviorPoolStore.getState().add({ title: '기타 연습', categoryId: 'hobby' });

    useTodayBehaviorStore.getState().drawRandomFromPool(2, {
      randomNumberGenerator: createSeededRng(123),
      now: new Date('2025-01-01T12:00:00'),
    });

    const { items } = useTodayBehaviorStore.getState();
    expect(items).toHaveLength(2);
    expect(new Set(items.map((i) => i.behaviorId)).size).toBe(2);
  });

  it('날짜 변경 시 오늘 행동 목록 비우기', () => {
    useBehaviorPoolStore.getState().add({ title: '스트레칭', categoryId: 'health' });
    const [first] = useBehaviorPoolStore.getState().items;
    useTodayBehaviorStore.getState().setFromPool([first!.id], new Date('2025-01-01'));
    expect(useTodayBehaviorStore.getState().items).toHaveLength(1);

    useTodayBehaviorStore.getState().ensureToday(new Date('2025-01-02T00:01:00'));
    expect(useTodayBehaviorStore.getState().items).toHaveLength(0);
  });

  it('오늘 행동 아이템 토글 시 행동 누적 수행 횟수 증감', () => {
    const created = useBehaviorPoolStore
      .getState()
      .add({ title: '물 마시기', categoryId: 'health' });
    useTodayBehaviorStore.getState().setFromPool([created.id], new Date('2025-01-01'));

    useTodayBehaviorStore.getState().toggleDone(created.id);
    expect(
      useBehaviorPoolStore.getState().items.find((b) => b.id === created.id)?.totalCompletions,
    ).toBe(1);

    useTodayBehaviorStore.getState().toggleDone(created.id);
    expect(
      useBehaviorPoolStore.getState().items.find((b) => b.id === created.id)?.totalCompletions,
    ).toBe(0);
  });
});
