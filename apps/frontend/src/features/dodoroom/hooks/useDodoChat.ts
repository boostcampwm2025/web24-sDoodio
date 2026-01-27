import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendDodoChat } from '@/features/dodoroom/apis/sendDodoChat.api';
import { fetchChatHistory } from '@/features/dodoroom/apis/fetchChatHistory.api';
import type { Message } from '@/features/dodoroom/types/dodo-chat.types';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'dodo',
    text: '안녕! 난 두두야.',
  },
];

const TYPING_ANIMATION_INTERVAL = 35;

const updateMessageText = (messages: Message[], id: string, text: string) =>
  messages.map((message) => (message.id === id ? { ...message, text } : message));

const createMessageId = () => {
  const cryptoId = globalThis.crypto?.randomUUID?.();
  if (cryptoId) return cryptoId;
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useDodoChat = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitialLoadRef = useRef(true);

  const canSend = input.trim().length > 0;
  const latestDodoMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'dodo'),
    [messages],
  );

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingHistory || !hasMore) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetchChatHistory(nextCursor ?? undefined, 10);

      if (response.messages.length > 0) {
        const historyMessages: Message[] = response.messages.reverse().map((msg) => ({
          id: msg.id,
          role: msg.role === 'assistant' ? 'dodo' : 'user',
          text: msg.content,
        }));

        setMessages((prev) => {
          const filteredPrev = prev.filter((msg) => msg.id !== 'msg-1');
          return [...historyMessages, ...filteredPrev];
        });
      }

      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch {
      // 히스토리 로드 실패 시 조용히 처리
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isLoadingHistory, hasMore, nextCursor]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      loadMoreMessages();
    }
  }, [loadMoreMessages]);

  useEffect(
    () => () => {
      if (typingTimerRef.current) {
        globalThis.clearInterval(typingTimerRef.current);
      }
    },
    [],
  );

  const animateDodoReply = useCallback((id: string, fullText: string) => {
    if (typingTimerRef.current) {
      globalThis.clearInterval(typingTimerRef.current);
    }

    let index = 0;
    typingTimerRef.current = globalThis.setInterval(() => {
      index += 1;
      const nextText = fullText.slice(0, index);

      setMessages((prev) => updateMessageText(prev, id, nextText));

      if (index >= fullText.length && typingTimerRef.current) {
        globalThis.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, TYPING_ANIMATION_INTERVAL);
  }, []);

  const handleSend = useCallback(() => {
    const value = input.trim();
    if (!value) return;
    const userMessageId = createMessageId();
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text: value }]);
    setInput('');

    sendDodoChat(value)
      .then((data) => {
        const dodoMessageId = createMessageId();
        setMessages((prev) => [...prev, { id: dodoMessageId, role: 'dodo', text: '' }]);
        animateDodoReply(dodoMessageId, data.reply);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: 'dodo',
            text: '잠시 후 다시 이야기해요.',
          },
        ]);
      });
  }, [animateDodoReply, input]);

  return {
    messages,
    input,
    setInput,
    canSend,
    latestDodoMessage,
    handleSend,
    loadMoreMessages,
    isLoadingHistory,
    hasMore,
  };
};
