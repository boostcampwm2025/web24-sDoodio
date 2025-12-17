import { beforeEach, describe, expect, it } from 'vitest';

import { WEEKDAYS } from '@/shared/behaviors/weekdays';

import { useBehaviorPoolStore } from './useBehaviorPoolStore';

describe('useBehaviorPoolStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useBehaviorPoolStore.setState({ items: [] });
  });

  it('행동 아이템 추가', () => {
    const created = useBehaviorPoolStore
      .getState()
      .add({ title: '  물 마시기  ', categoryId: 'health' });
    expect(created.title).toBe('물 마시기');
    expect(created.description).toBe('');
    expect(created.weekdays).toEqual([...WEEKDAYS]);
    expect(created.isAiRecommended).toBe(false);
    expect(created.totalCompletions).toBe(0);
    expect(useBehaviorPoolStore.getState().items[0]?.id).toBe(created.id);
  });
});
