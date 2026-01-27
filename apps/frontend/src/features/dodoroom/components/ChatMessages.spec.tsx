import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatMessages } from './ChatMessages';
import type { Message } from '../types/dodo-chat.types';

const messages: Message[] = [
  { id: '019bff30-00d3-7e7a-953a-0bcedbe53642', role: 'dodo', text: '안녕' },
  { id: '019bff30-30f2-7ebd-8a4c-1bbb62d59c6c', role: 'user', text: '반가워' },
];

describe('ChatMessages', () => {
  it('메시지 목록을 렌더링한다', () => {
    render(<ChatMessages messages={messages} />);

    expect(screen.getByText('안녕')).toBeInTheDocument();
    expect(screen.getByText('반가워')).toBeInTheDocument();
  });

  it('스크롤이 상단에 도달하면 onLoadMore를 호출한다', () => {
    const onLoadMore = vi.fn();
    render(<ChatMessages messages={messages} onLoadMore={onLoadMore} hasMore />);

    const container = screen.getByText('안녕').parentElement?.parentElement?.parentElement;
    if (!container) throw new Error('Container not found');

    // 스크롤 위치 조작 (상단 도달 시뮬레이션)
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 500, writable: true });

    fireEvent.scroll(container);

    expect(onLoadMore).toHaveBeenCalled();
  });
});
