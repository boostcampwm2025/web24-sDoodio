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

const createMessageId = (suffix?: string) => `msg-${Date.now()}${suffix ? `-${suffix}` : ''}`;

export const useDodoChat = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const typingTimerRef = useRef<number | null>(null);

  const canSend = input.trim().length > 0;
  const latestDodoMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'dodo'),
    [messages],
  );

  useEffect(
    () => () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    },
    [],
  );

  const animateDodoReply = useCallback((id: string, fullText: string) => {
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
    }

    let index = 0;
    typingTimerRef.current = window.setInterval(() => {
      index += 1;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, text: fullText.slice(0, index) } : msg)),
      );

      if (index >= fullText.length && typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, 35);
  }, []);

  const handleSend = useCallback(() => {
    const value = input.trim();
    if (!value) return;
    const userMessageId = createMessageId();
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text: value }]);
    setInput('');

    sendDodoChat(value)
      .then((data) => {
        const dodoMessageId = createMessageId('dodo');
        setMessages((prev) => [...prev, { id: dodoMessageId, role: 'dodo', text: '' }]);
        animateDodoReply(dodoMessageId, data.reply);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId('dodo'),
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
