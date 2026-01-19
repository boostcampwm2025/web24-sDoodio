import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteGoalBehaviors } from './deleteGoalBehaviors.api';

describe('deleteGoalBehaviors', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('DELETE 요청을 올바른 URL과 body로 보낸다', async () => {
    const mockFetch = vi.fn(() => Promise.resolve({ ok: true } as Response));
    globalThis.fetch = mockFetch as any;

    const goalId = 'goal-1';
    const idsToDelete = ['b1', 'b2'];

    await deleteGoalBehaviors(goalId, idsToDelete);

    expect(mockFetch).toHaveBeenCalledWith(`/api/goals/${goalId}/behaviors`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ behaviorIds: idsToDelete }),
    });
  });

  it('ok가 false면 에러 발생', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 } as Response)) as any;

    await expect(deleteGoalBehaviors('goal-1', [])).rejects.toThrow('Delete failed: 404');
  });
});
