import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { updateTodayBehaviorStatus } from './updateTodayBehaviorStatus.api';

describe('updateTodayBehaviorStatus', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('성공 시 응답을 반환한다', async () => {
    const id = '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d';
    const status = 'completed';
    const response = { id, status };

    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    });

    const result = await updateTodayBehaviorStatus(id, status);

    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(`/api/today-behaviors/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  });

  it('요청 실패 시 에러를 던진다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updateTodayBehaviorStatus('id', 'completed')).rejects.toThrow('Failed to fetch');
  });
});
