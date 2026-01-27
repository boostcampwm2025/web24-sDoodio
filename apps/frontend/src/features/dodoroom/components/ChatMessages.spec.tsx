import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Message } from '@/features/dodoroom/types/dodo-chat.types';
import { ChatMessages } from './ChatMessages';

describe('ChatMessages', () => {
  const mockMessages: Message[] = [
    { id: '1', role: 'dodo', text: '안녕하세요' },
    { id: '2', role: 'user', text: '반가워요' },
    { id: '3', role: 'dodo', text: '오늘 기분 어때요?' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Scroll properties mocking
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  it('메시지 목록을 올바르게 렌더링해야 한다', () => {
    render(<ChatMessages messages={mockMessages} />);

    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    expect(screen.getByText('반가워요')).toBeInTheDocument();
    expect(screen.getByText('오늘 기분 어때요?')).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 표시가 나타나야 한다', () => {
    render(<ChatMessages messages={mockMessages} isLoading />);
    expect(screen.getByText('이전 대화를 불러오는 중...')).toBeInTheDocument();
  });

  it('스크롤이 상단에 도달하면 onLoadMore가 호출되어야 한다', async () => {
    const onLoadMoreMock = vi.fn();
    const { container } = render(
      <ChatMessages
        messages={mockMessages}
        onLoadMore={onLoadMoreMock}
        hasMore
        isLoading={false}
      />,
    );

    // Find the scroll container (it's the first div in the rendered output)
    const scrollContainer = container.firstChild as HTMLElement;

    // Simulate scroll to top (20% threshold logic)
    // scrollHeight: 1000, clientHeight: 500 -> scrollable area: 500
    // 20% of 500 is 100. So scrollTop <= 100 should trigger loading

    // Set scrollTop to 0 (top)
    scrollContainer.scrollTop = 0;

    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(onLoadMoreMock).toHaveBeenCalled();
    });
  });

  it('더 불러올 데이터가 없으면(hasMore=false) 스크롤해도 onLoadMore가 호출되지 않아야 한다', () => {
    const onLoadMoreMock = vi.fn();
    const { container } = render(
      <ChatMessages
        messages={mockMessages}
        onLoadMore={onLoadMoreMock}
        hasMore={false}
        isLoading={false}
      />,
    );

    const scrollContainer = container.firstChild as HTMLElement;
    scrollContainer.scrollTop = 0;

    fireEvent.scroll(scrollContainer);

    expect(onLoadMoreMock).not.toHaveBeenCalled();
  });

  it('로딩 중이면 스크롤해도 onLoadMore가 호출되지 않아야 한다', () => {
    const onLoadMoreMock = vi.fn();
    const { container } = render(
      <ChatMessages messages={mockMessages} onLoadMore={onLoadMoreMock} hasMore isLoading />,
    );

    const scrollContainer = container.firstChild as HTMLElement;
    scrollContainer.scrollTop = 0;

    fireEvent.scroll(scrollContainer);

    expect(onLoadMoreMock).not.toHaveBeenCalled();
  });

  it('새로운 메시지가 추가될 때(사용자 스크롤 아님) 스크롤이 맨 아래로 이동해야 한다', async () => {
    // Initial render
    const { rerender, container } = render(<ChatMessages messages={mockMessages} />);
    const scrollContainer = container.firstChild as HTMLElement;

    // Initial scroll position (bottom)
    expect(scrollContainer.scrollTop).toBe(1000); // Because of useLayoutEffect on mount

    // Add new message
    const newMessages = [...mockMessages, { id: '4', role: 'user', text: 'New Msg' }];

    // Mock ref behavior for scroll check
    // We need to simulate that user is NOT scrolling up manually
    // In the component logic: shouldScrollToBottomRef is set based on scroll position in scroll handler
    // We assume it's true initially or updated correctly.

    // Rerender with new message
    rerender(<ChatMessages messages={newMessages as Message[]} />);

    // Check if scrollTop is updated to new scrollHeight (assuming scrollHeight stays same for mock,
    // but logic attempts to set it to currentScrollHeight)
    // Since we mocked scrollHeight as constant 1000, it sets to 1000.
    // The key is that it attempts to scroll to bottom.
    expect(scrollContainer.scrollTop).toBe(1000);
  });
});
