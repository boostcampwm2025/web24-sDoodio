import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Behavior } from '@web24/shared';
import { fetchGoalBehaviors } from './fetchGoalBehaviors.api';

describe('fetchGoalBehaviors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('goalId에 해당하는 행동 목록을 가져온다', async () => {
    const goalId = 'goal-1';

    const mockBehaviors: Behavior[] = [
      {
        id: '01941234-1234-7123-8123-123456789abc',
        title: '물 2L 마시기',
        goalId: '01941234-1234-7123-8123-123456789abc',
        difficulty: '몰입하기',
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockBehaviors,
    } as Response);

    const result = await fetchGoalBehaviors(goalId);

    expect(fetch).toHaveBeenCalledWith(`/api/goals/${goalId}/behaviors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(result).toEqual(mockBehaviors);
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(fetchGoalBehaviors('goal-1')).rejects.toThrow('Failed to fetch behaviors');
  });
});
