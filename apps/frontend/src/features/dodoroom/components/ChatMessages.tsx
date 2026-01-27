import type { Message } from '@/features/dodoroom/types/dodo-chat.types';

type ChatMessagesProps = {
  messages: Message[];
};

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
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
