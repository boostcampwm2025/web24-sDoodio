import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_BEHAVIOR_EXTRACTION_RATIO } from '@web24/shared';
import useAuthStore from './useAuthStore';

const mockFetch = (options: { ok: boolean; status: number; json?: () => Promise<unknown> }) => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: options.ok,
    status: options.status,
    json: options.json ?? (async () => ({})),
  } as Response);
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false, error: null });
    vi.restoreAllMocks();
  });

  describe('fetchMe', () => {
    it('로그인 상태면 유저 정보를 저장한다', async () => {
      const user = {
        id: '019bd5d8-72dc-78ca-af5d-c93358058b32',
        nickname: 'G-abcd12',
        kind: 'guest',
        behaviorRatio: DEFAULT_BEHAVIOR_EXTRACTION_RATIO,
      };
      mockFetch({ ok: true, status: 200, json: async () => user });

      const result = await useAuthStore.getState().fetchMe();

      expect(result).toEqual(user);
      expect(useAuthStore.getState().user).toEqual(user);
    });

    it('로그인 상태가 아니면 null을 반환한다', async () => {
      mockFetch({ ok: false, status: 401 });

      const result = await useAuthStore.getState().fetchMe();

      expect(result).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('loginGuest', () => {
    it('게스트 로그인 후 유저 정보를 저장한다', async () => {
      const user = {
        id: '019bd5d8-72dc-78ca-af5d-c93358058b32',
        nickname: 'G-abcd12',
        kind: 'guest',
        behaviorRatio: DEFAULT_BEHAVIOR_EXTRACTION_RATIO,
      };
      mockFetch({ ok: true, status: 200, json: async () => user });

      const result = await useAuthStore.getState().loginGuest();

      expect(result).toEqual(user);
      expect(useAuthStore.getState().user).toEqual(user);
    });
  });

  describe('logout', () => {
    it('로그아웃하면 유저 정보를 비운다', async () => {
      useAuthStore.setState({
        user: {
          id: '019bd5d8-72dc-78ca-af5d-c93358058b32',
          nickname: 'G-abcd12',
          kind: 'guest',
          behaviorRatio: DEFAULT_BEHAVIOR_EXTRACTION_RATIO,
        },
        isLoading: false,
        error: null,
      });
      mockFetch({ ok: true, status: 200 });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
