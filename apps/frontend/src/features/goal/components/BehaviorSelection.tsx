import { BEHAVIOR_TITLE_MAX_LENGTH } from '@web24/shared';
import { InputItemRow } from './InputItemRow';

export interface BehaviorItem {
  id: string;
  title: string;
}

interface BehaviorSelectionProps {
  behaviors: BehaviorItem[];
  onChangeBehaviorTitle: (behaviorId: string, newTitle: string) => void;
  onDelete: (behaviorId: string) => void;
  onAdd: () => void;
}

export function BehaviorSelection({
  behaviors,
  onChangeBehaviorTitle,
  onDelete,
  onAdd,
}: BehaviorSelectionProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {behaviors.map((item) => (
        <InputItemRow
          key={item.id}
          value={item.title}
          onChange={(newTitle) => {
            onChangeBehaviorTitle(item.id, newTitle);
          }}
          onDelete={() => onDelete(item.id)}
          onAdd={onAdd}
          placeholder="행동 이름"
          variant="default"
          maxLength={BEHAVIOR_TITLE_MAX_LENGTH}
        />
      ))}

      <InputItemRow
        value=""
        onChange={() => {}}
        onDelete={() => {}}
        onAdd={onAdd}
        placeholder="행동 추가"
        variant="add"
      />
    </div>
  );
}
