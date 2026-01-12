import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetGoalsResponseSchema } from '@web24/shared';
import { fetchGoals } from './fetchGoals.api';

describe('fetchGoals', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('goals 목록을 정상적으로 반환한다', async () => {
    const mockResponse = [
      {
        id: '55555555-5555-4555-8555-555555555555',
        title: '개발 서적',
        color: 'beige',
        createdAt: '2026-01-08T12:29:52.365Z',
        updatedAt: '2026-01-08T12:29:52.365Z',
      },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchGoals();

    expect(result).toEqual(GetGoalsResponseSchema.parse(mockResponse));
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(fetchGoals()).rejects.toThrow('Failed to fetch');
  });
});
