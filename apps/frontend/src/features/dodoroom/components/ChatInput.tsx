type ChatInputProps = {
  value: string;
  canSend: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function ChatInput({ value, canSend, onChange, onSend }: ChatInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-primary-weak/60 bg-bg-light/80 flex items-center gap-2 rounded-full border px-3 py-2">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="두두에게 말해보세요"
        className="text-label-normal placeholder:text-label-alternative flex-1 bg-transparent text-sm outline-none"
        type="text"
      />
      <button
        type="button"
        onClick={onSend}
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
}
