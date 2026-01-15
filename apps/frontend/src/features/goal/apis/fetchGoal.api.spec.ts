import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetGoalResponseSchema } from '@web24/shared';
import { fetchGoal } from './fetchGoal.api';

describe('fetchGoal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('goal 상세를 정상적으로 반환한다', async () => {
    const goalId = '019bba2d-6702-79f4-b5f9-ee83fa4729f6';
    const mockResponse = {
      id: goalId,
      title: '건강 목표',
      color: 'pink',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchGoal(goalId);

    expect(fetch).toHaveBeenCalledWith(`/api/goals/${goalId}`, expect.any(Object));
    expect(result).toEqual(GetGoalResponseSchema.parse(mockResponse));
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(fetchGoal('goal-1')).rejects.toThrow('Failed to fetch goal');
  });
});
