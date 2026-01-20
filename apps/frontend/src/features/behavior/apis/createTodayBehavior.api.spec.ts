import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PostTodayBehaviorResponse } from '@web24/shared';
import { createTodayBehavior } from './createTodayBehavior.api';

describe('createTodayBehavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('behaviorId로 오늘 행동을 추가한다', async () => {
    const behaviorId = '01941234-1234-7123-8123-123456789abc';
    const mockResponse: PostTodayBehaviorResponse = [
      {
        id: '01941234-1234-7123-8123-123456789abc',
        title: '물 2L 마시기',
        goalTitle: '건강한 생활',
        goalColor: 'mint',
        difficulty: '몰입하기',
        isChecked: false,
        isRecommended: false,
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await createTodayBehavior(behaviorId);

    expect(fetch).toHaveBeenCalledWith('/api/today-behaviors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ behaviorId }),
    });
    expect(result).toEqual(mockResponse);
  });

  it('응답이 실패하면 에러를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Today behavior already exists' }),
    } as Response);

    await expect(createTodayBehavior('01941234-1234-7123-8123-123456789abc')).rejects.toThrow(
      'Today behavior already exists',
    );
  });
});
