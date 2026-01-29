import { useEffect, useRef, useState } from 'react';

interface DodoSpeechBubbleProps {
  text?: string;
}

export function DodoSpeechBubble({ text }: DodoSpeechBubbleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopBlur, setShowTopBlur] = useState(false);
  const [showBottomBlur, setShowBottomBlur] = useState(false);

  // 스크롤 위치에 따라 상/하단 블러 표시 여부 결정
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    setShowTopBlur(scrollTop > 0);
    setShowBottomBlur(scrollTop + clientHeight < scrollHeight - 1);
  };

  useEffect(() => {
    handleScroll();
  }, [text]);

  if (!text) return null;

  return (
    <div className="absolute bottom-[68%] left-1/2 z-20 w-full max-w-[90%] -translate-x-1/2 px-4 md:bottom-[70%] md:w-fit md:max-w-[80%] md:px-0">
      <div className="border-primary-strong-2 bg-bg-light text-label-normal text-md relative rounded-2xl border p-2 text-center font-bold shadow">
        <div className="relative">
          {/* 상단 페이드 */}
          <div
            className={`from-bg-light pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-linear-to-b to-transparent transition-opacity duration-200 ${
              showTopBlur ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="scrollbar-pretty max-h-24 overflow-y-auto overscroll-contain break-keep"
          >
            {text}
          </div>

          {/* 하단 페이드 */}
          <div
            className={`from-bg-light pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-6 bg-linear-to-t to-transparent transition-opacity duration-200 ${
              showBottomBlur ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <span className="border-primary-strong-2 bg-bg-light absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b" />
      </div>
    </div>
  );
}
