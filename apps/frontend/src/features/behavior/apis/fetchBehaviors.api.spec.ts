// __tests__/fetchTodayBehaviors.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { fetchTodayBehaviors } from './fetchBehaviors.api';

describe('fetchTodayBehaviors', () => {
  const mockBehaviors: Behavior[] = [
    {
      id: '1',
      title: '행동 1',
      goalTitle: '목표 A',
      goalColor: 'beige',
      isChecked: false,
      difficulty: '시작하기',
      isRecommended: true,
    },
    {
      id: '2',
      title: '행동 2',
      goalTitle: '목표 B',
      goalColor: 'pink',
      isChecked: true,
      difficulty: '몰입하기',
      isRecommended: false,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns behaviors on success', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBehaviors,
    });

    const result = await fetchTodayBehaviors();
    expect(result).toEqual(mockBehaviors);
    expect(fetch).toHaveBeenCalledWith('/api/behavior', expect.any(Object));
  });

  it('throws error on fetch failure', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchTodayBehaviors()).rejects.toThrow('Failed to fetch');
  });
});
