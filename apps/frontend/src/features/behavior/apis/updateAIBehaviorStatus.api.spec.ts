import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { updateAIBehaviorStatus } from './updateAIBehaviorStatus.api';

describe('updateAIBehaviorStatus', () => {
  const mockId = '01946777-7000-7000-8000-000000000000';
  const mockResponse = {
    id: mockId,
    status: 'completed',
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('성공 시 업데이트된 상태를 반환한다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await updateAIBehaviorStatus(mockId, 'completed');
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `/api/today-behaviors/ai/${mockId}/status`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      }),
    );
  });

  it('응답이 ok가 아니면 에러를 던진다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updateAIBehaviorStatus(mockId, 'completed')).rejects.toThrow('Failed to fetch');
  });
});
