import { useEffect, useState } from 'react';

interface DodoChatProps {
  quote: string;
}

function DodoChat({ quote }: DodoChatProps) {
  const [displayedQuote, setDisplayedQuote] = useState('');

  useEffect(() => {
    setDisplayedQuote('');

    let index = 0;

    const intervalId = setInterval(() => {
      index += 1;
      setDisplayedQuote(quote.slice(0, index));

      if (index >= quote.length) {
        clearInterval(intervalId);
      }
    }, 80);

    return () => clearInterval(intervalId);
  }, [quote]);

  return (
    <div className="flex items-center gap-6">
      {/* 두두 */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center">
        <img src="/dodo.png" alt="두두 이미지" className="h-full w-full object-contain" />
      </div>

      {/* 말풍선 */}
      <div className="bg-bg-light text-label-normal relative w-fit max-w-2xl rounded-2xl px-6 py-6 shadow-[var(--shadow-emphasize)]">
        <div className="border-r-bg-light absolute top-1/2 -left-3 h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[12px] border-y-transparent" />
        <p className="leading-relaxed font-medium">
          {displayedQuote}
          <span className="ml-0.5 animate-pulse">▍</span>
        </p>
      </div>
    </div>
  );
}

export default DodoChat;
