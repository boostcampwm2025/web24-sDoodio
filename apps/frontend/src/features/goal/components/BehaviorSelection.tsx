import { BEHAVIOR_TITLE_MAX_LENGTH } from '@web24/shared';
import { Check, ListPlus, Plus, Sparkles } from 'lucide-react';
import { InputItemRow } from './InputItemRow';

export interface BehaviorItem {
  id: string;
  title: string;
}

interface BehaviorSelectionProps {
  behaviors: BehaviorItem[];
  recommendations: string[];
  onChangeBehaviorTitle: (behaviorId: string, newTitle: string) => void;
  onDelete: (behaviorId: string) => void;
  onAdd: (title?: string) => void;
}

export function BehaviorSelection({
  behaviors,
  recommendations,
  onChangeBehaviorTitle,
  onDelete,
  onAdd,
}: BehaviorSelectionProps) {
  const currentTitles = new Set(behaviors.map((b) => b.title));

  return (
    <div className="flex w-full flex-col gap-8 font-sans">
      {/* 템플릿 추천 영역: 선택하면 아래 목록으로 추가됨 */}
      {recommendations.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="text-primary-strong flex items-center gap-2 px-1">
            <ListPlus className="h-4 w-4" />
            <span className="text-sm font-bold tracking-tight uppercase">추가할 행동 선택</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recommendations.map((text) => {
              const isSelected = currentTitles.has(text);
              return (
                <button
                  key={text}
                  type="button"
                  onClick={() => !isSelected && onAdd(text)}
                  className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary-weak/10 text-label-disable cursor-default border border-transparent'
                      : 'text-label-normal hover:border-primary-weak border border-gray-100 bg-white shadow-sm hover:shadow-md'
                  } `}
                >
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="text-primary-strong h-3.5 w-3.5" />
                  )}
                  {text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 선택된 행동 리스트 영역 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="text-primary-strong flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold tracking-tight uppercase">
              나의 행동 목록 ({behaviors.length})
            </span>
          </div>
          {behaviors.length > 0 && (
            <span className="text-label-disable text-[10px]">
              항목을 수정하거나 삭제할 수 있어요
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {behaviors.length > 0 ? (
            behaviors.map((item) => (
              <InputItemRow
                key={item.id}
                value={item.title}
                onChange={(newTitle) => onChangeBehaviorTitle(item.id, newTitle)}
                onDelete={() => onDelete(item.id)}
                onAdd={() => onAdd()}
                placeholder="행동 내용을 적어줘"
                variant="default"
                maxLength={BEHAVIOR_TITLE_MAX_LENGTH}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 py-10">
              <p className="text-label-disable text-sm">위에서 행동을 선택하거나 직접 추가해봐!</p>
            </div>
          )}

          {/* 직접 추가 버튼 (빈 항목 생성) */}
          <InputItemRow
            value=""
            onChange={() => {}}
            onDelete={() => {}}
            onAdd={() => onAdd()}
            placeholder="새로운 행동 직접 쓰기"
            variant="add"
          />
        </div>
      </div>
    </div>
  );
}
