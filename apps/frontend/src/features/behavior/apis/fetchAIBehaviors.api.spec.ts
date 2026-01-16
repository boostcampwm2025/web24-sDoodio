import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchAIBehaviors } from './fetchAIBehaviors.api';

describe('fetchAIBehaviors', () => {
  const mockBehaviors = [
    {
      id: '01946777-7000-7000-8000-000000000000',
      title: '행동 1',
      goalTitle: '목표 A',
      goalColor: 'mint',
      isChecked: false,
      difficulty: '시작하기',
      isRecommended: true,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('성공 시 추천 행동 리스트를 반환한다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBehaviors,
    });

    const result = await fetchAIBehaviors();
    expect(result).toEqual(mockBehaviors);
    expect(fetch).toHaveBeenCalledWith(
      '/api/today-behaviors/ai',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('응답이 ok가 아니면 에러를 던진다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchAIBehaviors()).rejects.toThrow('Failed to fetch');
  });
});
