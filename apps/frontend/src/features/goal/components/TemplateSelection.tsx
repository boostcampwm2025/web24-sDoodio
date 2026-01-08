import type { GoalTemplateListResponse } from '@web24/shared';
import { GoalTemplateButton } from './GoalTemplateButton';

interface TemplateSelectionProps {
  selectedTemplateId: string | null;
  customTemplateId: string;
  templates: GoalTemplateListResponse;
  onSelect: (newSelectedTemplateId: string) => void;
}

export function TemplateSelection({
  selectedTemplateId = null,
  customTemplateId,
  templates,
  onSelect,
}: TemplateSelectionProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3">
      {templates.map((template) => (
        <GoalTemplateButton
          key={template.id}
          label={template.title}
          selected={template.id === selectedTemplateId}
          onClick={() => onSelect(template.id)}
        />
      ))}
      <GoalTemplateButton
        label="직접 추가하기"
        selected={selectedTemplateId === customTemplateId}
        onClick={() => onSelect(customTemplateId)}
      />
    </div>
  );
}
