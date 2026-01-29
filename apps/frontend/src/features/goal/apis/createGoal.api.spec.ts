import { describe, expect, it, vi, afterEach } from 'vitest';
import type { CreateGoalRequest } from '@web24/shared';

import { DomainError } from '@/shared/errors/domain-error';
import { ERROR_MESSAGE_PREFIX } from '@web24/shared';
import { createGoal } from './createGoal.api';

describe('createGoal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('정상 응답이면 fetch를 호출하고 생성 결과를 반환한다', async () => {
    const request: CreateGoalRequest = {
      goalTitle: '건강',
      goalColor: 'blue',
      behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
        title: '건강',
        color: 'blue',
        behaviors: [
          {
            id: '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e',
            title: '물 한 컵 마시기',
            difficulty: '마음열기',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(createGoal(request)).resolves.toEqual({
      id: '01890fba-7e6a-7b6b-9e5d-0f3c9b8b4c6d',
      title: '건강',
      color: 'blue',
      behaviors: [
        {
          id: '01890fba-7e6a-7b6c-9e5d-0f3c9b8b4c6e',
          title: '물 한 컵 마시기',
          difficulty: '마음열기',
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/goals'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }),
    );
  });

  it('응답이 정상적이지 않으면 에러를 던진다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ message: 'test' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createGoal({
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
      }),
    ).rejects.toThrow('Request failed: 500');
  });

  it('응답 스키마가 유효하지 않으면 에러를 던진다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'invalid' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createGoal({
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
      }),
    ).rejects.toThrow();
  });

  it('에러 메시지가 ERROR_MESSAGE_PREFIX로 시작하면 DomainError를 던진다', async () => {
    const errorMessage = '이미 존재하는 목표입니다';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: `${ERROR_MESSAGE_PREFIX}${errorMessage}` }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createGoal({
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
      }),
    ).rejects.toThrow(DomainError);

    try {
      await createGoal({
        goalTitle: '건강',
        goalColor: 'blue',
        behaviors: [{ title: '물 한 컵 마시기', difficulty: '마음열기' }],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).message).toBe(errorMessage);
    }
  });
});
