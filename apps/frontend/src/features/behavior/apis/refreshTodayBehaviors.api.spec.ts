import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { refreshTodayBehaviors } from './refreshTodayBehaviors.api';

describe('refreshTodayBehaviors', () => {
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

    const result = await refreshTodayBehaviors();

    expect(result).toEqual(mockBehaviors);
    expect(fetch).toHaveBeenCalledWith('/api/today-behaviors/refresh', expect.any(Object));
  });

  it('throws error on fetch failure', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(refreshTodayBehaviors()).rejects.toThrow('Failed to fetch');
  });
});
