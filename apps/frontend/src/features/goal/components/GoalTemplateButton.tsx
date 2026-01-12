interface GoalTemplateButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function GoalTemplateButton({ label, selected, onClick }: GoalTemplateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-16 w-full items-center justify-between rounded-2xl px-6 text-left transition-colors ${
        selected
          ? 'bg-secondary-normal text-label-normal ring-secondary-normal ring-1'
          : 'bg-bg-normal text-label-normal hover:bg-bg-alternative hover:text-label-alternative'
      }`}
    >
      <span className="text-headline-1 font-semibold">{label}</span>
    </button>
  );
}
