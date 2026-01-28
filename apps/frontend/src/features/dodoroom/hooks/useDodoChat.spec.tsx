import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendDodoChat } from '@/features/dodoroom/apis/sendDodoChat.api';
import { fetchChatHistory } from '@/features/dodoroom/apis/fetchChatHistory.api';
import { useDodoChat } from './useDodoChat';
import { DODO_ACTION_COMMAND_MAP } from '../constants/dodo-action';

// --- Mocks ---
vi.mock('@/features/dodoroom/apis/sendDodoChat.api', () => ({
  sendDodoChat: vi.fn(),
}));

vi.mock('@/features/dodoroom/apis/fetchChatHistory.api', () => ({
  fetchChatHistory: vi.fn(),
}));

describe('useDodoChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    (fetchChatHistory as any).mockResolvedValue({
      messages: [],
      hasMore: false,
      nextCursor: null,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('초기 렌더링 시 채팅 히스토리를 불러와야 한다', async () => {
    const mockHistory = [
      { id: 'old-1', role: 'user', content: '안녕' },
      { id: 'old-2', role: 'assistant', content: '반가워' },
    ];
    (fetchChatHistory as any).mockResolvedValue({
      messages: mockHistory,
      hasMore: true,
      nextCursor: 'cursor-123',
    });

    const { result } = renderHook(() => useDodoChat());

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    expect(fetchChatHistory).toHaveBeenCalledWith(undefined, 10);
    expect(result.current.messages.length).toBe(2);
    expect(result.current.hasMore).toBe(true);
  });

  it('메시지를 전송하면 사용자 메시지와 두두의 응답(빈 상태)이 추가되어야 한다', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useDodoChat());
    const userMessage = '안녕 두두';
    const dodoReply = '반가워!';

    (sendDodoChat as any).mockResolvedValue({ reply: dodoReply, action: 'None' });

    act(() => {
      result.current.setInput(userMessage);
    });

    await act(async () => {
      result.current.handleSend();
    });

    expect(result.current.messages).toHaveLength(3);

    // 사용자 메시지 확인
    expect(result.current.messages[1].text).toBe(userMessage);
    expect(result.current.messages[1].role).toBe('user');

    // 두두 메시지 확인 (아직 타이핑 전이라 빈 값)
    expect(result.current.messages[2].role).toBe('dodo');
    expect(result.current.messages[2].text).toBe('');

    act(() => {
      vi.advanceTimersByTime(35 * dodoReply.length + 100);
    });

    // 텍스트 완성 확인
    expect(result.current.messages[2].text).toBe(dodoReply);
  });

  it('전송 실패 시 에러 메시지가 표시되어야 한다', async () => {
    const { result } = renderHook(() => useDodoChat());
    (sendDodoChat as any).mockRejectedValue(new Error('Network Error'));

    act(() => {
      result.current.setInput('테스트');
    });

    await act(async () => {
      result.current.handleSend();
    });

    await waitFor(() => {
      const lastMsg = result.current.messages[result.current.messages.length - 1];
      expect(lastMsg.role).toBe('dodo');
      expect(lastMsg.text).toBe('잠시 후 다시 이야기해요.');
    });
  });

  it('더보기(loadMoreMessages) 호출 시 추가 데이터를 불러와야 한다', async () => {
    (fetchChatHistory as any)
      .mockResolvedValueOnce({
        messages: [{ id: 'old-1', role: 'user', content: '1' }],
        hasMore: true,
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        messages: [{ id: 'old-2', role: 'user', content: '2' }],
        hasMore: false,
        nextCursor: null,
      });

    const { result } = renderHook(() => useDodoChat());

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.isLoadingHistory).toBe(false);
    });

    await act(async () => {
      await result.current.loadMoreMessages();
    });

    expect(fetchChatHistory).toHaveBeenCalledTimes(2);
    expect(fetchChatHistory).toHaveBeenLastCalledWith('cursor-1', 10);

    // 메시지 병합 확인
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
  });

  it('handleActionButton 호출 시 해당 액션에 매핑된 명령어로 메시지를 전송해야 한다', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useDodoChat());
    const action = 'Wink';
    const command = DODO_ACTION_COMMAND_MAP[action];
    const dodoReply = '폴짝!';

    (sendDodoChat as any).mockResolvedValue({ reply: dodoReply, action });

    // handleActionButton 호출
    await act(async () => {
      result.current.handleActionButton(action as any);
    });

    expect(result.current.messages).toHaveLength(3); // 초기 + 유저 + 두두

    const userMsg = result.current.messages[1];
    expect(userMsg.role).toBe('user');
    expect(userMsg.text).toBe(command);

    expect(sendDodoChat).toHaveBeenCalledWith(command);

    const dodoMsg = result.current.messages[2];
    expect(dodoMsg.role).toBe('dodo');

    act(() => {
      vi.advanceTimersByTime(35 * dodoReply.length + 100);
    });

    expect(result.current.messages[2].text).toBe(dodoReply);
  });

  it('handleSend에 command 인자를 직접 전달하면 input 상태와 무관하게 전송되어야 한다', async () => {
    const { result } = renderHook(() => useDodoChat());
    const command = '/test_command';
    const dodoReply = '테스트 응답';

    (sendDodoChat as any).mockResolvedValue({ reply: dodoReply, action: 'None' });

    // input은 비어있는 상태
    expect(result.current.input).toBe('');

    await act(async () => {
      result.current.handleSend(command);
    });

    expect(sendDodoChat).toHaveBeenCalledWith(command);
    expect(result.current.messages[1].text).toBe(command);
  });
});
