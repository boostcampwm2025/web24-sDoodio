import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Behavior } from '@web24/shared';
import { fetchAllBehaviors } from './fetchAllBehaviors.api';

describe('fetchAllBehaviors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('모든 행동 목록을 성공적으로 가져온다', async () => {
    const mockBehaviors: Behavior[] = [
      {
        id: 'b1',
        title: '물 2L 마시기',
        goalId: 'g1',
        difficulty: '몰입하기',
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockBehaviors,
    } as Response);

    const result = await fetchAllBehaviors();

    expect(fetch).toHaveBeenCalledWith('/api/behavior/all', {
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

    await expect(fetchAllBehaviors()).rejects.toThrow('Failed to fetch all behaviors');
  });
});
