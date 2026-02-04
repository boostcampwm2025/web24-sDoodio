import { useState } from 'react';
import { ChatInput } from '@/features/dodoroom/components/ChatInput';
import { ChatMessages } from '@/features/dodoroom/components/ChatMessages';
import { DodoSpeechBubble } from '@/features/dodoroom/components/DodoSpeechBubble';
import { useDodoChat } from '@/features/dodoroom/hooks/useDodoChat';
import { DodoCharacter } from '@/features/dodoroom/components/DodoCharacter';
import { DODO_ACTION_VALUES } from '@web24/shared';
import { DodoActionButton } from '@/features/dodoroom/components/DodoActionButton';

export function DodoRoomPage() {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const {
    dodoAction,
    messages,
    input,
    setInput,
    canSend,
    latestDodoMessage,
    handleSend,
    loadMoreMessages,
    isLoadingHistory,
    isSendingMessage,
    isDodoResponding,
    hasMore,
    handleActionButton,
  } = useDodoChat();

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
      <div className="flex h-100 flex-col gap-4 md:h-[55vh] md:flex-row">
        <section
          className="relative flex max-h-[55vh] flex-1 items-center justify-center overflow-hidden rounded-3xl border border-transparent bg-cover bg-center p-4 md:min-w-92"
          style={{ backgroundImage: "url('/BlueAndWhiteRoom.png')" }}
        >
          <div className="absolute inset-0" />
          <div className="relative z-10 flex h-full w-full items-end justify-center rounded-2xl pb-10">
            <DodoSpeechBubble text={latestDodoMessage?.text} />
            <DodoCharacter action={dodoAction} />
          </div>
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            {DODO_ACTION_VALUES.filter((v) => v !== 'None').map((action) => (
              <DodoActionButton
                key={action}
                action={action}
                onClick={handleActionButton}
                disabled={isDodoResponding}
              />
            ))}
          </div>
        </section>

        <section className="border-primary-weak/60 bg-bg-light/80 hidden min-h-0 w-full max-w-md flex-col gap-4 rounded-3xl border p-4 md:flex">
          <div className="text-label-normal text-sm font-semibold">채팅</div>
          <ChatMessages
            messages={messages}
            onLoadMore={loadMoreMessages}
            isLoading={isLoadingHistory}
            isSendingMessage={isSendingMessage}
            hasMore={hasMore}
          />
          <ChatInput
            value={input}
            canSend={canSend}
            onChange={setInput}
            onSend={() => handleSend()}
          />
        </section>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        <ChatInput
          value={input}
          canSend={canSend}
          onChange={setInput}
          onSend={() => handleSend()}
        />
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
          <div className="border-primary-weak/60 bg-bg-light relative z-10 flex h-[60vh] min-h-0 w-full flex-col gap-4 rounded-t-3xl border p-4">
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
            <ChatMessages
              messages={messages}
              onLoadMore={loadMoreMessages}
              isLoading={isLoadingHistory}
              hasMore={hasMore}
            />
            <ChatInput
              value={input}
              canSend={canSend}
              onChange={setInput}
              onSend={() => handleSend()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
