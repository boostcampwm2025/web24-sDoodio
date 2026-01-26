import { useState } from 'react';
import { ChatInput } from '@/features/dodoroom/components/ChatInput';
import { ChatMessages } from '@/features/dodoroom/components/ChatMessages';
import { DodoSpeechBubble } from '@/features/dodoroom/components/DodoSpeechBubble';
import { useDodoChat } from '@/features/dodoroom/hooks/useDodoChat';

export function DodoRoomPage() {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const { messages, input, setInput, canSend, latestDodoMessage, handleSend } = useDodoChat();

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
      <div className="flex h-100 flex-col gap-4 md:h-auto md:flex-row">
        <section
          className="relative flex max-h-[55vh] flex-1 items-center justify-center overflow-hidden rounded-3xl border border-transparent bg-cover bg-center p-4 md:h-150 md:max-h-none md:min-w-92"
          style={{ backgroundImage: "url('/BlueAndWhiteRoom.png')" }}
        >
          <div className="absolute inset-0" />
          <div className="relative z-10 flex h-full w-full items-end justify-center rounded-2xl pb-10">
            <DodoSpeechBubble text={latestDodoMessage?.text} />
            <img
              src="/DodoStand.png"
              alt="두두 캐릭터"
              className="h-[60%] max-h-90 w-auto select-none"
            />
          </div>
        </section>

        <section className="border-primary-weak/60 bg-bg-light/80 hidden w-full max-w-md flex-col gap-4 rounded-3xl border p-4 md:flex">
          <div className="text-label-normal text-sm font-semibold">채팅</div>
          <div className="flex-1">
            <ChatMessages messages={messages} />
          </div>
          <ChatInput value={input} canSend={canSend} onChange={setInput} onSend={handleSend} />
        </section>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        <ChatInput value={input} canSend={canSend} onChange={setInput} onSend={handleSend} />
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
            <div className="flex-1">
              <ChatMessages messages={messages} />
            </div>
            <ChatInput value={input} canSend={canSend} onChange={setInput} onSend={handleSend} />
          </div>
        </div>
      )}
    </div>
  );
}
