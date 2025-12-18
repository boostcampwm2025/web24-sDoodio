import DodoChat from '@/shared/components/DodoChat';

interface HeroProps {
  nickname: string;
  quote: string;
}

export function Hero({ nickname, quote }: HeroProps) {
  return (
    <section className="animate-fade-in mb-10 w-full">
      {/* 인사말 */}
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
        안녕하세요, {nickname}님!
      </h1>

      <DodoChat quote={quote} />
    </section>
  );
}
