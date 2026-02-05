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
      className={`flex w-full items-center justify-between rounded-2xl px-6 py-4 text-left transition-colors ${
        selected
          ? 'bg-secondary-normal text-label-normal ring-secondary-normal ring-1'
          : 'bg-bg-normal text-label-normal hover:bg-bg-alternative hover:text-label-alternative'
      }`}
    >
      <span className="text-sm font-semibold md:text-base lg:text-lg">{label}</span>
    </button>
  );
}
