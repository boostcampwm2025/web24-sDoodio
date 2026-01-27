import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchChatHistory } from './fetchChatHistory.api';

vi.mock('@web24/shared', () => ({
  DodoChatHistoryResponseSchema: {
    parse: (data: any) => data, // 검증 통과 가정
  },
}));

describe('fetchChatHistory API', () => {
  // fetch 모킹
  const fetchMock = vi.fn();
  globalThis.fetch = fetchMock;

  beforeEach(() => {
    fetchMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('기본 파라미터(limit=10)로 API를 호출해야 한다', async () => {
    // Mock response
    const mockResponse = {
      messages: [],
      hasMore: false,
      nextCursor: null,
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchChatHistory();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toContain('/api/chat/history');
    expect(url).toContain('limit=10'); // 기본값 확인
    expect(options.method).toBe('GET');

    expect(result).toEqual(mockResponse);
  });

  it('cursor와 limit 파라미터를 포함하여 API를 호출해야 한다', async () => {
    const cursor = 'msg-123';
    const limit = 20;
    const mockResponse = {
      messages: [{ id: 'msg-123', content: 'test', role: 'user' }],
      hasMore: true,
      nextCursor: 'msg-100',
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchChatHistory(cursor, limit);

    const [url] = fetchMock.mock.calls[0];

    expect(url).toContain(`cursor=${cursor}`);
    expect(url).toContain(`limit=${limit}`);
  });

  it('API 응답이 실패하면 에러를 던져야 한다', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchChatHistory()).rejects.toThrow('Failed to fetch chat history');
  });
});
