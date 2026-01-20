import { GOAL_TITLE_MAX_LENGTH, type Goal, type GoalColor } from '@web24/shared';
import { GOAL_COLOR_STYLES } from '@/shared/constants/goalColor';
import { GoalColorPickerPopover } from './GoalColorPicker';

interface ViewHeaderProps {
  goal?: Goal;
  onStartEdit: () => void;
}

interface EditHeaderProps {
  title: string;
  color: GoalColor;
  onChangeTitle: (v: string) => void;
  onChangeColor: (c: GoalColor) => void;
  onCancel: () => void;
  onSave: () => void;
}

interface GoalDetailPageHeaderProps {
  goal?: Goal;
  isLoading: boolean;

  isEditing: boolean;
  editTitle: string;
  editColor: GoalColor;

  onChangeTitle: (v: string) => void;
  onChangeColor: (c: GoalColor) => void;

  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

// 보기모드 헤더
function ViewHeader({ goal, onStartEdit }: ViewHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 왼쪽 */}
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          {goal?.title ?? '목표'}
          {goal && <span className={`h-5 w-5 rounded-full ${GOAL_COLOR_STYLES[goal.color].bg}`} />}
        </h1>
      </div>

      {/* 오른쪽 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onStartEdit}
          className="border-label-alternative text-label-normal cursor-pointer rounded-lg border px-4 py-1 hover:bg-gray-100"
        >
          편집
        </button>

        <button
          disabled
          type="button"
          className="cursor-not-allowed rounded-lg bg-[#c94949] px-4 py-1 font-medium text-white"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

// 수정 모드 헤더
function EditHeader({
  title,
  color,
  onChangeTitle,
  onChangeColor,
  onCancel,
  onSave,
}: EditHeaderProps) {
  const titleLength = title.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 왼쪽 */}
      <div className="flex flex-1 items-center gap-3">
        {/* 제목 input wrapper */}
        <div className="relative max-w-100 flex-1">
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            maxLength={GOAL_TITLE_MAX_LENGTH}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="focus:ring-primary-strong border-primary-normal w-full rounded-lg border px-3 py-2 pr-10 text-2xl font-bold focus:ring-2 focus:outline-none"
            placeholder="목표 제목"
          />

          {/* 글자 수 */}
          <span className="text-label-disable pointer-events-none absolute top-1/2 right-2 text-xs">
            {titleLength}/{GOAL_TITLE_MAX_LENGTH}
          </span>
        </div>

        {/* 색상 원 + 팝오버 */}
        <GoalColorPickerPopover selectedColor={color} onSelect={onChangeColor} />
      </div>

      {/* 오른쪽 버튼 */}
      <div className="flex gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="border-label-normal text-label-normal hover:bg-bg-alternative cursor-pointer rounded-lg border px-4 py-1"
        >
          취소
        </button>

        <button
          type="button"
          onClick={onSave}
          className="bg-primary-strong hover:bg-primary-normal cursor-pointer rounded-lg px-4 py-1 font-medium text-white"
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default function GoalDetailPageHeader({
  goal,
  isLoading,
  isEditing,
  editTitle,
  editColor,
  onChangeTitle,
  onChangeColor,
  onStartEdit,
  onCancel,
  onSave,
}: GoalDetailPageHeaderProps) {
  if (isLoading) {
    return (
      <header className="mb-6">
        <div className="h-10 w-1/3 animate-pulse rounded bg-gray-200" />
      </header>
    );
  }

  return (
    <header className="mb-6">
      {isEditing ? (
        <EditHeader
          title={editTitle}
          color={editColor}
          onChangeTitle={onChangeTitle}
          onChangeColor={onChangeColor}
          onCancel={onCancel}
          onSave={onSave}
        />
      ) : (
        <ViewHeader goal={goal} onStartEdit={onStartEdit} />
      )}
    </header>
  );
}
