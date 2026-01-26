import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendDodoChat } from '@/features/dodoroom/apis/sendDodoChat.api';
import type { Message } from '@/features/dodoroom/types/dodo-chat.types';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'dodo',
    text: '안녕하세요! 전 두두에요',
  },
];

const TYPING_ANIMATION_INTERVAL = 35;

const createMessageId = () => {
  const cryptoId = globalThis.crypto?.randomUUID?.();
  if (cryptoId) return cryptoId;
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useDodoChat = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSend = input.trim().length > 0;
  const latestDodoMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'dodo'),
    [messages],
  );

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

      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, text: nextText } : msg)));

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
  };
};
