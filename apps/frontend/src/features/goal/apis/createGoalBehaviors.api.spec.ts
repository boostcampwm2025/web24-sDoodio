import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Behavior } from '@web24/shared';
import { createGoalBehaviors } from './createGoalBehaviors.api';

describe('createGoalBehaviors', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('POST 요청을 올바른 URL과 body로 보낸다', async () => {
    const mockFetch = vi.fn(() => Promise.resolve({ ok: true } as Response));
    globalThis.fetch = mockFetch as any;

    const goalId = 'goal-1';
    const behaviors: Omit<Behavior, 'id'>[] = [
      { title: '물 1컵 마시기', difficulty: '마음열기' },
      { title: '스트레칭 5분', difficulty: '시작하기' },
    ];

    await createGoalBehaviors(goalId, behaviors);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${goalId}/behaviors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ behaviors }),
    });
  });

  it('응답이 ok가 아니면 에러를 던진다', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response)) as any;

    const goalId = 'goal-1';
    const behaviors: Omit<Behavior, 'id'>[] = [{ title: '물 1컵 마시기', difficulty: '마음열기' }];

    await expect(createGoalBehaviors(goalId, behaviors)).rejects.toThrow('Create failed: 500');
  });
});
