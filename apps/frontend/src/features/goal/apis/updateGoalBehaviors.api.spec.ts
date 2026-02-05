import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Behavior } from '@web24/shared';
import { updateGoalBehaviors } from './updateGoalBehaviors.api';

describe('updateGoalBehaviors', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('PATCH 요청을 올바른 URL과 body로 보낸다', async () => {
    const mockFetch = vi.fn(() => Promise.resolve({ ok: true } as Response));
    globalThis.fetch = mockFetch as any;

    const goalId = '123e4567-e89b-12d3-a456-426614174000';
    const behaviors: Behavior[] = [{ id: 'b1', title: '물 1컵 마시기', difficulty: '마음열기' }];

    await updateGoalBehaviors(goalId, behaviors);

    expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${goalId}/behaviors`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ behaviors }),
    });
  });

  it('ok가 false면 에러 발생', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response)) as any;

    await expect(updateGoalBehaviors('goal-1', [])).rejects.toThrow('Update failed: 500');
  });
});
