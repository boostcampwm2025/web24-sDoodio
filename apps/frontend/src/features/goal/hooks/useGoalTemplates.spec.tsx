import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { useGoalTemplates } from './useGoalTemplates';

const fetchGoalTemplates = vi.fn();

vi.mock('../apis/fetchGoalTemplates.api', () => ({
  fetchGoalTemplates: (...args: unknown[]) => fetchGoalTemplates(...args),
}));

describe('useGoalTemplates', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('템플릿을 로드하고 상태를 갱신한다', async () => {
    fetchGoalTemplates.mockResolvedValueOnce([
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

    const { result } = renderHook(() => useGoalTemplates());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('요청 실패 시 에러 메시지를 설정한다', async () => {
    fetchGoalTemplates.mockRejectedValueOnce(new Error('불러오기 실패'));

    const { result } = renderHook(() => useGoalTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toEqual([]);
    expect(result.current.error).toBe('불러오기 실패');
  });
});
