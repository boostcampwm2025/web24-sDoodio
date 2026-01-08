import { describe, expect, it, vi, afterEach } from 'vitest';

import { fetchGoalTemplates } from './fetchGoalTemplates.api';

describe('fetchGoalTemplates', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('정상 응답이면 fetch를 호출하고 템플릿 목록을 반환한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'template-1',
          title: '건강',
          level: {
            마음열기: ['물 한 컵 마시기'],
            시작하기: ['스트레칭 5분'],
            이어가기: ['주 2회 운동'],
            몰입하기: ['헬스장 1시간'],
          },
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchGoalTemplates()).resolves.toEqual([
      {
        id: 'template-1',
        title: '건강',
        level: {
          마음열기: ['물 한 컵 마시기'],
          시작하기: ['스트레칭 5분'],
          이어가기: ['주 2회 운동'],
          몰입하기: ['헬스장 1시간'],
        },
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/goals/templates'));
  });

  it('응답이 정상적이지 않으면 에러를 던진다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchGoalTemplates()).rejects.toThrow('Request failed: 500');
  });

  it('응답 스키마가 유효하지 않으면 에러를 던진다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'template-1' }],
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchGoalTemplates()).rejects.toThrow();
  });
});
