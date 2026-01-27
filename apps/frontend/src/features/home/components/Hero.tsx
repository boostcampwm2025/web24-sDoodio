import DodoChat from '@/shared/components/DodoChat';

interface HeroProps {
  quote: string;
}

export function Hero({ quote }: HeroProps) {
  return (
    <section className="animate-fade-in w-full">
      <DodoChat quote={quote} />
    </section>
  );
}
