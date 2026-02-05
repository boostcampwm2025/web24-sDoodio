import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTopBehaviors } from './fetchTopBehaviors.api';

describe('fetchTopBehaviors', () => {
  const mockResponse = {
    all: {
      totalCount: 10,
      items: [
        {
          id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6c',
          behaviorTitle: '운동',
          behaviorDifficulty: '몰입하기',
          goalTitle: '건강',
          goalColor: 'mint',
          count: 6,
        },
      ],
    },
    goals: [
      {
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        goalTitle: '건강',
        goalColor: 'mint',
        totalCount: 6,
        items: [
          {
            id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6e',
            behaviorTitle: '운동',
            behaviorDifficulty: '몰입하기',
            count: 6,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    // global.fetch mock
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('성공적으로 데이터를 fetch하고 schema parse 결과를 반환한다', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchTopBehaviors();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/stats/top-behaviors',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    expect(result.all.totalCount).toBe(10);
    expect(result.goals[0].goalTitle).toBe('건강');
  });

  it('응답이 ok가 아니면 에러를 throw한다', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(fetchTopBehaviors()).rejects.toThrow('Failed to fetch');
  });

  it('응답이 schema와 맞지 않으면 Zod 에러를 throw한다', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        invalid: 'data',
      }),
    });

    await expect(fetchTopBehaviors()).rejects.toThrow();
  });
});
