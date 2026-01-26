import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDodoChat } from './useDodoChat';

const sendDodoChat = vi.fn();

vi.mock('@/features/dodoroom/apis/sendDodoChat.api', () => ({
  sendDodoChat: (message: string) => sendDodoChat(message),
}));

describe('useDodoChat', () => {
  beforeEach(() => {
    sendDodoChat.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 메시지를 가진다', () => {
    const { result } = renderHook(() => useDodoChat());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('dodo');
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
