import { describe, expect, it, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { fetchChatHistory } from './fetchChatHistory.api';

describe('fetchChatHistory', () => {
  const result = {
    messages: [
      {
        id: '55555555-5555-4555-8555-555555555555',
        role: 'user',
        content: 'hello',
      },
    ],
    hasMore: false,
    nextCursor: null,
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('채팅 히스토리를 불러온다', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(result),
    });

    const response = await fetchChatHistory();

    expect(response).toEqual(result);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/history'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('커서와 리미트를 포함해서 호출한다', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(result),
    });

    await fetchChatHistory('cursor-1', 20);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('cursor=cursor-1'),
      expect.anything(),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=20'),
      expect.anything(),
    );
  });

  it('API 호출 실패 시 에러를 던진다', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
    });

    await expect(fetchChatHistory()).rejects.toThrow('Failed to fetch chat history');
  });
});
