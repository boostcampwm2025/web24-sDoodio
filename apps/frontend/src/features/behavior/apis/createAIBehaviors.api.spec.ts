import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAIBehaviors } from './createAIBehaviors.api';

describe('createAIBehaviors', () => {
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

  it('성공 시 생성된 행동 리스트를 반환한다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBehaviors,
    });

    const result = await createAIBehaviors();
    expect(result).toEqual(mockBehaviors);
    expect(fetch).toHaveBeenCalledWith(
      '/api/today-behaviors/ai',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('응답이 ok가 아니면 에러를 던진다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    await expect(createAIBehaviors()).rejects.toThrow('Failed to fetch');
  });

  it('데이터가 스키마에 맞지 않으면 에러를 던진다', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ invalid: 'data' }],
    });

    await expect(createAIBehaviors()).rejects.toThrow();
  });
});
