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
    }, 150);

    return () => clearInterval(intervalId);
  }, [quote]);

  return (
    <div className="flex items-center gap-6">
      {/* 두두 */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center">
        <img src="/dodo.png" alt="두두 이미지" className="h-full w-full object-contain" />
      </div>

      {/* 말풍선 */}
      <div className="relative w-fit max-w-2xl rounded-2xl bg-zinc-600 px-6 py-6 text-white shadow-xl">
        <div className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[12px] border-y-transparent border-r-zinc-600" />
        <p className="font-medium leading-relaxed">
          {displayedQuote}
          <span className="ml-0.5 animate-pulse">▍</span>
        </p>
      </div>
    </div>
  );
}

export default DodoChat;
