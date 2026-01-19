import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import type { GetGoalStampsResponse } from '@web24/shared';
import { fetchGoalStamps } from './fetchGoalStamps.api';

describe('fetchGoalStamps', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('GET 요청 후 데이터를 최신순으로 정렬해서 반환한다', async () => {
    const goalId = 'goal-1';
    const apiResponse: GetGoalStampsResponse = [
      {
        id: '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c55',
        title: '행동 A',
        difficulty: '몰입하기',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c56',
        title: '행동 B',
        difficulty: '시작하기',
        updatedAt: '2024-01-03T00:00:00.000Z',
      },
      {
        id: '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c57',
        title: '행동 C',
        difficulty: '마음열기',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    } as Response);

    const result = await fetchGoalStamps(goalId);

    // fetch 호출 확인
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${goalId}/stamps`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    // 최신순 정렬 확인
    expect(result.map((r) => r.id)).toEqual([
      '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c56',
      '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c57',
      '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c55',
    ]);
  });

  it('fetch 실패 시 에러를 던진다', async () => {
    const goalId = 'goal-1';
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    await expect(fetchGoalStamps(goalId)).rejects.toThrow('Failed to fetch goal stamps');
  });

  it('잘못된 JSON이면 Zod 에러를 던진다', async () => {
    const goalId = 'goal-1';
    // Zod parse 실패용 잘못된 데이터
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'data' }),
    } as Response);

    await expect(fetchGoalStamps(goalId)).rejects.toThrow();
  });
});
