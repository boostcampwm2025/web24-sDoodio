import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDodoChat } from '@/features/dodoroom/hooks/useDodoChat';
import { DODO_ACTION_VALUES } from '@web24/shared';
import { DodoRoomPage } from './DodoRoomPage';

vi.mock('@/features/dodoroom/hooks/useDodoChat', () => ({
  useDodoChat: vi.fn(),
}));

vi.mock('@/features/dodoroom/components/ChatInput', () => ({
  ChatInput: ({ value, onChange, onSend }: any) => (
    <div data-testid="chat-input">
      <input data-testid="input-field" value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" data-testid="send-button" onClick={onSend}>
        Send
      </button>
    </div>
  ),
}));

vi.mock('@/features/dodoroom/components/ChatMessages', () => ({
  ChatMessages: ({ messages, onLoadMore }: any) => (
    <div data-testid="chat-messages">
      {messages.map((m: any) => (
        <div key={m.id}>{m.text}</div>
      ))}
      <button type="button" data-testid="load-more-button" onClick={onLoadMore}>
        Load More
      </button>
    </div>
  ),
}));

vi.mock('@/features/dodoroom/components/DodoSpeechBubble', () => ({
  DodoSpeechBubble: ({ text }: any) => <div data-testid="speech-bubble">{text}</div>,
}));

vi.mock('@/features/dodoroom/components/DodoCharacter', () => ({
  DodoCharacter: ({ action }: any) => <div data-testid="dodo-character">{action}</div>,
}));

vi.mock('@/features/dodoroom/components/DodoActionButton', () => ({
  DodoActionButton: ({ action, onClick }: any) => (
    <button type="button" data-testid={`action-btn-${action}`} onClick={() => onClick(action)}>
      {action}
    </button>
  ),
}));

describe('DodoRoomPage', () => {
  const mockHandleSend = vi.fn();
  const mockLoadMoreMessages = vi.fn();
  const mockSetInput = vi.fn();
  const mockHandleActionButton = vi.fn();

  const defaultHookValues = {
    dodoAction: 'Idle',
    messages: [
      { id: '1', role: 'dodo', text: '안녕!' },
      { id: '2', role: 'user', text: '반가워' },
    ],
    input: '',
    setInput: mockSetInput,
    canSend: false,
    latestDodoMessage: { id: '1', role: 'dodo', text: '안녕!' },
    handleSend: mockHandleSend,
    loadMoreMessages: mockLoadMoreMessages,
    isLoadingHistory: false,
    isSendingMessage: false,
    hasMore: true,
    handleActionButton: mockHandleActionButton,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDodoChat as any).mockReturnValue(defaultHookValues);
  });

  it('페이지가 정상적으로 렌더링되어야 한다', () => {
    render(<DodoRoomPage />);

    expect(screen.getByTestId('dodo-character')).toHaveTextContent('Idle');
    expect(screen.getByTestId('speech-bubble')).toHaveTextContent('안녕!');

    const validActions = DODO_ACTION_VALUES.filter((v) => v !== 'None');
    validActions.forEach((action) => {
      expect(screen.getByTestId(`action-btn-${action}`)).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('chat-input')).toHaveLength(2);
    expect(screen.getAllByTestId('chat-messages')).toHaveLength(1);
  });

  it('메시지 입력 및 전송이 동작해야 한다', () => {
    render(<DodoRoomPage />);

    const inputField = screen.getAllByTestId('input-field')[0]; // Desktop input
    const sendButton = screen.getAllByTestId('send-button')[0];

    fireEvent.change(inputField, { target: { value: 'Hello' } });
    expect(mockSetInput).toHaveBeenCalledWith('Hello');

    fireEvent.click(sendButton);
    expect(mockHandleSend).toHaveBeenCalled();
  });

  it('액션 버튼을 클릭하면 handleActionButton이 호출되어야 한다', () => {
    render(<DodoRoomPage />);

    const action = 'Wink';
    const actionBtn = screen.getByTestId(`action-btn-${action}`);

    fireEvent.click(actionBtn);
    expect(mockHandleActionButton).toHaveBeenCalledWith(action);
  });

  it('모바일에서 "채팅 내역 보기" 버튼을 누르면 시트가 열려야 한다', async () => {
    render(<DodoRoomPage />);

    const openSheetBtn = screen.getByText('채팅 내역 보기');
    fireEvent.click(openSheetBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId('chat-messages')).toHaveLength(2);
    });

    const closeSheetBtn = screen.getByText('닫기');
    fireEvent.click(closeSheetBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId('chat-messages')).toHaveLength(1);
    });
  });
});
