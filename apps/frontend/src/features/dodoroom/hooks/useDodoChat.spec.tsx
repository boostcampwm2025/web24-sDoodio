import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDodoChat } from './useDodoChat';

const sendDodoChat = vi.fn();
const fetchChatHistory = vi.fn();

vi.mock('@/features/dodoroom/apis/sendDodoChat.api', () => ({
  sendDodoChat: (message: string) => sendDodoChat(message),
}));

vi.mock('@/features/dodoroom/apis/fetchChatHistory.api', () => ({
  fetchChatHistory: (cursor?: string, limit?: number) => fetchChatHistory(cursor, limit),
}));

describe('useDodoChat', () => {
  beforeEach(() => {
    sendDodoChat.mockReset();
    fetchChatHistory.mockReset();
    fetchChatHistory.mockResolvedValue({
      messages: [],
      hasMore: false,
      nextCursor: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 메시지를 가진다 (히스토리 로딩 전)', () => {
    const { result } = renderHook(() => useDodoChat());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('dodo');
  });

  it('마운트 시 히스토리를 불러와서 앞에 추가한다', async () => {
    fetchChatHistory.mockResolvedValue({
      messages: [
        { id: 'h1', role: 'user', content: '과거 메시지' },
        { id: 'h2', role: 'assistant', content: '과거 답변' },
      ],
      hasMore: true,
      nextCursor: 'h2',
    });

    const { result } = renderHook(() => useDodoChat());

    await waitFor(() => {
      // 초기 메시지(1) + 히스토리(2) = 3
      expect(result.current.messages).toHaveLength(3);
    });

    expect(result.current.messages[0].text).toBe('과거 메시지');
    expect(result.current.messages[1].text).toBe('과거 답변');
    expect(fetchChatHistory).toHaveBeenCalledTimes(1);
  });

  it('loadMoreMessages 호출 시 추가 히스토리를 불러온다', async () => {
    fetchChatHistory
      .mockResolvedValueOnce({
        messages: [{ id: 'h1', role: 'user', content: 'old1' }],
        hasMore: true,
        nextCursor: 'h1',
      })
      .mockResolvedValueOnce({
        messages: [{ id: 'h0', role: 'assistant', content: 'old0' }],
        hasMore: false,
        nextCursor: null,
      });

    const { result } = renderHook(() => useDodoChat());

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2); // old1 + init
    });

    await act(async () => {
      await result.current.loadMoreMessages();
    });

    expect(result.current.messages).toHaveLength(3); // old0 + old1 + init
    expect(result.current.messages[0].text).toBe('old0');
    expect(fetchChatHistory).toHaveBeenCalledTimes(2);
    expect(fetchChatHistory).toHaveBeenLastCalledWith('h1', 10);
  });

  it('메시지를 보내면 사용자 메시지와 두두 응답을 추가한다', async () => {
    sendDodoChat.mockResolvedValueOnce({ reply: '반가워요!' });

    const { result } = renderHook(() => useDodoChat());

    act(() => {
      result.current.setInput('안녕');
    });

    act(() => {
      result.current.handleSend();
    });

    expect(sendDodoChat).toHaveBeenCalledWith('안녕');
    expect(result.current.messages.some((msg) => msg.role === 'user')).toBe(true);

    await waitFor(() => {
      expect(result.current.messages.some((msg) => msg.role === 'dodo')).toBe(true);
    });

    await waitFor(() => {
      const dodoMessages = result.current.messages.filter((msg) => msg.role === 'dodo');
      expect(dodoMessages).toHaveLength(2);
      expect(dodoMessages[1].text).toBe('반가워요!');
    });
  });
});
