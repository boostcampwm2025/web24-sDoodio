import { useMemo, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'dodo';
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'dodo',
    text: 'Hi!',
  },
  { id: 'msg-2', role: 'user', text: '안녕하세요' },
];

export function DodoRoomPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0, [input]);
  const latestDodoMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'dodo'),
    [messages],
  );

  const handleSend = () => {
    const value = input.trim();
    if (!value) return;
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, role: 'user', text: value }]);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  const renderMessages = () => (
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

  const renderInput = () => (
    <div className="border-primary-weak/60 bg-bg-light/80 flex items-center gap-2 rounded-full border px-3 py-2">
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="두두에게 말해보세요"
        className="text-label-normal placeholder:text-label-alternative flex-1 bg-transparent text-sm outline-none"
        type="text"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
          canSend
            ? 'bg-primary-strong text-bg-light'
            : 'text-label-disable bg-bg-alternative cursor-not-allowed'
        }`}
      >
        보내기
      </button>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
      <div className="flex h-100 flex-col gap-4 md:h-auto md:flex-row">
        <section
          className="relative flex max-h-[55vh] flex-1 items-center justify-center overflow-hidden rounded-3xl border border-transparent bg-cover bg-center p-4 md:h-150 md:max-h-none md:min-w-92"
          style={{ backgroundImage: "url('/BlueAndWhiteRoom.png')" }}
        >
          <div className="absolute inset-0" />
          <div className="relative z-10 flex h-full w-full items-end justify-center rounded-2xl pb-10">
            {latestDodoMessage && (
              <div className="absolute bottom-[70%] left-1/2 w-[content] -translate-x-1/2 md:bottom-[67%]">
                <div className="border-primary-strong-2 bg-bg-light text-label-normal text-md relative rounded-2xl border px-4 py-3 text-center font-bold shadow">
                  {latestDodoMessage.text}
                  <span className="border-primary-strong-2 bg-bg-light absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b" />
                </div>
              </div>
            )}
            <img
              src="/DodoStand.png"
              alt="두두 캐릭터"
              className="h-[60%] max-h-90 w-auto select-none"
            />
          </div>
        </section>

        <section className="border-primary-weak/60 bg-bg-light/80 hidden w-full max-w-md flex-col gap-4 rounded-3xl border p-4 md:flex">
          <div className="text-label-normal text-sm font-semibold">채팅</div>
          <div className="flex-1">{renderMessages()}</div>
          {renderInput()}
        </section>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {renderInput()}
        <button
          type="button"
          onClick={() => setIsMobileSheetOpen(true)}
          className="bg-primary-strong text-bg-light rounded-full px-4 py-2 text-sm font-semibold shadow"
        >
          채팅 내역 보기
        </button>
      </div>

      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:hidden">
          <button
            type="button"
            aria-label="채팅 닫기"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileSheetOpen(false)}
          />
          <div className="border-primary-weak/60 bg-bg-light relative z-10 flex h-[60vh] w-full flex-col gap-4 rounded-t-3xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-label-normal text-sm font-semibold">채팅</span>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="text-label-alternative text-sm"
              >
                닫기
              </button>
            </div>
            <div className="flex-1">{renderMessages()}</div>
            {renderInput()}
          </div>
        </div>
      )}
    </div>
  );
}
