import { useEffect, useMemo, useState } from 'react';
import {
  BEHAVIOR_DIFFICULTIES,
  BEHAVIOR_TITLE_MAX_LENGTH,
  type Behavior,
  type BehaviorDifficulty,
} from '@web24/shared';
import { DifficultyBadge } from '@/shared/components/behavior/DifficultyBadge';
import { Minus, Plus } from 'lucide-react';
import { DIFFICULTY_COLOR_STYLES } from '@/shared/constants/difficultyColor';
import { createGoalBehaviors } from '../apis/createGoalBehaviors.api';
import { updateGoalBehaviors } from '../apis/updateGoalBehaviors.api';
import { deleteGoalBehaviors } from '../apis/deleteGoalBehaviors.api';

type DifficultyFilter = 'ALL' | BehaviorDifficulty;
const VISIBLE_DIFFICULTIES = BEHAVIOR_DIFFICULTIES.filter((difficulty) => difficulty !== 'AI');

interface GoalBehaviorListProps {
  goalId: string;
  behaviors?: Behavior[];
  isLoading: boolean;
  onRefetch: () => void;
}

export function GoalBehaviorList({
  goalId,
  behaviors,
  isLoading,
  onRefetch,
}: GoalBehaviorListProps) {
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [localBehaviors, setLocalBehaviors] = useState<Behavior[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // 초기 데이터 로드 시 로컬 상태 동기화
  useEffect(() => {
    if (behaviors) {
      setLocalBehaviors(behaviors);
    }
  }, [behaviors]);

  // 편집 모드 토글
  const toggleEditMode = () => {
    if (isEditing) {
      if (behaviors) setLocalBehaviors(behaviors);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // 행동 추가
  const handleAddBehavior = () => {
    const newBehavior: Behavior = {
      id: `new-${Date.now()}`,
      title: '',
      difficulty: '마음열기',
    };
    setLocalBehaviors([...localBehaviors, newBehavior]);
  };

  // 행동 삭제
  const handleDeleteBehavior = (id: string) => {
    setLocalBehaviors(localBehaviors.filter((b) => b.id !== id));
  };

  // 행동 제목 수정
  const handleChangeTitle = (id: string, newTitle: string) => {
    setLocalBehaviors(localBehaviors.map((b) => (b.id === id ? { ...b, title: newTitle } : b)));
  };

  // 행동 난이도 수정
  const handleChangeDifficulty = (id: string, newDifficulty: BehaviorDifficulty) => {
    setLocalBehaviors(
      localBehaviors.map((b) => (b.id === id ? { ...b, difficulty: newDifficulty } : b)),
    );
  };

  // 행동 저장
  const handleSave = async () => {
    const validBehaviors = localBehaviors.filter((b) => b.title.trim() !== '');

    // 새로운 행동
    const toCreate = validBehaviors
      .filter((b) => b.id.startsWith('new-'))
      .map(({ id, ...rest }) => rest);

    // 기존 행동
    const toUpdate = validBehaviors.filter((b) => !b.id.startsWith('new-'));

    // 삭제한 행동
    const currentIds = new Set(validBehaviors.map((b) => b.id));
    const toDeleteIds = (behaviors || []).filter((b) => !currentIds.has(b.id)).map((b) => b.id);

    try {
      const promises = [];

      if (toCreate.length > 0) {
        promises.push(createGoalBehaviors(goalId, toCreate));
      }
      if (toUpdate.length > 0) {
        promises.push(updateGoalBehaviors(goalId, toUpdate));
      }
      if (toDeleteIds.length > 0) {
        promises.push(deleteGoalBehaviors(goalId, toDeleteIds));
      }

      // 3. 병렬 처리
      await Promise.all(promises);
      onRefetch();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  // 렌더링용 데이터
  const EMPTY_BEHAVIORS: Behavior[] = [];

  const currentBehaviors = isEditing ? localBehaviors : (behaviors ?? EMPTY_BEHAVIORS);

  const difficultyCounts = useMemo(() => {
    const base = BEHAVIOR_DIFFICULTIES.reduce(
      (acc, difficulty) => {
        acc[difficulty] = 0;
        return acc;
      },
      {} as Record<BehaviorDifficulty, number>,
    );

    currentBehaviors.forEach((behavior) => {
      base[behavior.difficulty] += 1;
    });

    return base;
  }, [currentBehaviors]);

  const filteredBehaviors = useMemo(() => {
    if (activeFilter === 'ALL') return currentBehaviors;
    return currentBehaviors.filter((behavior) => behavior.difficulty === activeFilter);
  }, [currentBehaviors, activeFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2">
        {/* 왼쪽: 필터 칩들 */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <button
            type="button"
            className={`bg-primary-strong text-bg-light rounded-full border px-3 py-1 text-[12px] font-bold transition ${
              activeFilter === 'ALL'
                ? 'border-primary-strong opacity-100'
                : 'border-primary-weak opacity-60 hover:opacity-100'
            }`}
            onClick={() => setActiveFilter('ALL')}
          >
            전체 {currentBehaviors?.length ?? 0}
          </button>

          {VISIBLE_DIFFICULTIES.map((difficulty) => (
            <DifficultyBadge
              key={difficulty}
              level={difficulty}
              count={difficultyCounts[difficulty]}
              selected={activeFilter === difficulty}
              onClick={() => setActiveFilter(difficulty)}
              className="px-3 py-1 text-[12px]"
            />
          ))}
        </div>

        {/* 오른쪽: 편집 버튼 */}
        <div className="ml-auto shrink-0">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleEditMode}
                className="border-secondary-weak text-primary-strong cursor-pointer rounded-full border px-3 py-1 text-[12px] font-bold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-secondary-strong text-bg-light cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleEditMode}
              className="bg-secondary-strong text-bg-light cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold"
            >
              수정
            </button>
          )}
        </div>
      </div>

      {isLoading && <p className="text-label-disable text-sm">행동을 불러오는 중...</p>}

      <div className="flex flex-col gap-3">
        {filteredBehaviors.map((behavior: Behavior) => (
          <div
            key={behavior.id}
            className="bg-bg-light flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm transition-all duration-200"
          >
            {/* 내용 수정 */}
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  placeholder="행동을 입력해주세요"
                  value={behavior.title}
                  maxLength={BEHAVIOR_TITLE_MAX_LENGTH}
                  onChange={(e) => handleChangeTitle(behavior.id, e.target.value)}
                  className="text-label-normal w-full bg-transparent font-semibold focus:outline-none"
                />
              ) : (
                <p className="text-label-alternative truncate font-semibold">{behavior.title}</p>
              )}
            </div>

            {/* 난이도 표시 */}
            <div className="relative shrink-0">
              {isEditing ? (
                <>
                  <DifficultyBadge
                    level={behavior.difficulty}
                    onClick={() =>
                      setOpenDropdownId(openDropdownId === behavior.id ? null : behavior.id)
                    }
                    className="hover:ring-primary-strong/30 cursor-pointer hover:ring-2 hover:ring-offset-1"
                  />

                  {/* 난이도 선택 드롭다운 */}
                  {openDropdownId === behavior.id && (
                    <div className="animate-in fade-in zoom-in-95 border-bg-normal bg-bg-light absolute top-full -left-3 z-20 mt-2 flex w-max flex-col gap-1 rounded-xl border p-1.5 shadow-xl duration-100">
                      {BEHAVIOR_DIFFICULTIES.map((diff) => (
                        <button
                          type="button"
                          key={diff}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeDifficulty(behavior.id, diff);
                            setOpenDropdownId(null);
                          }}
                          className={`rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                            behavior.difficulty === diff
                              ? `${DIFFICULTY_COLOR_STYLES[behavior.difficulty].bg} ${DIFFICULTY_COLOR_STYLES[behavior.difficulty].txt}`
                              : 'text-label-disable hover:bg-primary-strong/30'
                          } `}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <DifficultyBadge level={behavior.difficulty} />
              )}
            </div>

            {/* 삭제 버튼 */}
            {isEditing && (
              <button
                type="button"
                onClick={() => handleDeleteBehavior(behavior.id)}
                className="text-primary-weak hover:text-label-disable transition-colors"
                aria-label="지우기"
              >
                <Minus className="h-6 w-6 stroke-[3px]" />
              </button>
            )}
          </div>
        ))}
        {/* 행동 추가 버튼 */}
        {isEditing && (
          <button
            type="button"
            onClick={handleAddBehavior}
            className="border-primary-strong/40 text-label-alternative hover:bg-bg-light hover:border-primary-normal mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 font-bold"
          >
            <Plus size={20} strokeWidth={2.5} /> 추가
          </button>
        )}
      </div>
    </div>
  );
}
