type DodoSpeechBubbleProps = {
  text?: string;
};

export function DodoSpeechBubble({ text }: DodoSpeechBubbleProps) {
  if (!text) return null;

  return (
    <div className="absolute bottom-[70%] left-1/2 w-fit -translate-x-1/2 md:bottom-[67%]">
      <div className="border-primary-strong-2 bg-bg-light text-label-normal text-md relative rounded-2xl border px-4 py-3 text-center font-bold shadow">
        {text}
        <span className="border-primary-strong-2 bg-bg-light absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b" />
      </div>
    </div>
  );
}
