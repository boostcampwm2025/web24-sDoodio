import { useEffect, useRef, useLayoutEffect } from 'react';
import type { Message } from '@/features/dodoroom/types/dodo-chat.types';

type ChatMessagesProps = {
  messages: Message[];
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
};

const SCROLL_BOTTOM_THRESHOLD = 50;
const LOAD_MORE_SCROLL_PERCENTAGE = 20;

export function ChatMessages({ messages, onLoadMore, isLoading, hasMore }: ChatMessagesProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const isUserScrollingRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);
  const isMountedRef = useRef(false);
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isMountedRef.current) return;

    isMountedRef.current = true;
    container.scrollTop = container.scrollHeight;
    previousScrollHeightRef.current = container.scrollHeight;
    shouldScrollToBottomRef.current = true;
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return () => {};

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const isAtBottom = scrollHeight - scrollTop - clientHeight < SCROLL_BOTTOM_THRESHOLD;
      shouldScrollToBottomRef.current = isAtBottom;

      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

      if (scrollPercentage <= LOAD_MORE_SCROLL_PERCENTAGE && !isLoading && hasMore && onLoadMore) {
        isUserScrollingRef.current = true;
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, onLoadMore]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMountedRef.current) return;

    const currentScrollHeight = container.scrollHeight;
    const previousScrollHeight = previousScrollHeightRef.current;

    if (isUserScrollingRef.current && currentScrollHeight > previousScrollHeight) {
      const heightDifference = currentScrollHeight - previousScrollHeight;
      container.scrollTop += heightDifference;
      isUserScrollingRef.current = false;
    } else if (shouldScrollToBottomRef.current) {
      container.scrollTop = currentScrollHeight;
    }

    previousScrollHeightRef.current = currentScrollHeight;
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="scrollbar-pretty flex flex-1 flex-col gap-3 overflow-y-scroll pr-1"
      style={{ minHeight: 0 }}
    >
      {isLoading && (
        <div className="flex justify-center py-2">
          <span className="text-label-assistive text-sm">이전 대화를 불러오는 중...</span>
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
              message.role === 'user'
                ? 'bg-primary-strong text-bg-light'
                : 'bg-bg-light text-label-normal border-primary-weak/60 border'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
}
