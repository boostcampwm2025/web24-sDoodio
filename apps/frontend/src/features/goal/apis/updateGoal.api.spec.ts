import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateGoalResponseSchema, type UpdateGoalRequest } from '@web24/shared';
import { updateGoal } from './updateGoal.api';

describe('updateGoal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('PUT 요청을 올바른 URL과 body로 보낸다', async () => {
    const mockResponse = {
      id: '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c55',
      title: '업데이트된 목표',
      color: 'beige',
    };
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response),
    );
    globalThis.fetch = mockFetch as any;

    const goalId = '01890c6a-3f6b-7c9a-8e3a-9f3b1a2d4c55';
    const request: UpdateGoalRequest = { title: '업데이트된 목표', color: 'beige' };

    const result = await updateGoal(goalId, request);

    // fetch 호출 확인
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${goalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    // 반환값 zod 스키마 검증
    expect(result).toEqual(UpdateGoalResponseSchema.parse(mockResponse));
  });

  it('ok가 false면 에러 발생', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response)) as any;

    await expect(updateGoal('goal-1', { title: '테스트', color: 'beige' })).rejects.toThrow(
      'Request failed: 500',
    );
  });

  it('응답이 스키마와 맞지 않으면 zod 에러 발생', async () => {
    const invalidResponse = { wrong: 'field' };
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(invalidResponse),
      } as Response),
    ) as any;

    const goalId = 'goal-1';
    const request: UpdateGoalRequest = { title: '테스트', color: 'beige' };

    await expect(updateGoal(goalId, request)).rejects.toThrow();
  });
});
