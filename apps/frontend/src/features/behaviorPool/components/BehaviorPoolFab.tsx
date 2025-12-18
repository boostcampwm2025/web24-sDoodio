import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import type { BehaviorCategoryId } from '@/shared/types/behavior.types';
import { WEEKDAYS, type Weekday } from '@/shared/constants/weekdays';
import { useBehaviorCategoryStore } from '@/stores/useBehaviorCategoryStore';
import { useBehaviorPoolStore } from '@/stores/useBehaviorPoolStore';
import { useTodayBehaviorStore } from '@/stores/useTodayBehaviorStore';

type DialogKind = 'today' | 'create' | 'categories' | null;

const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
};

function DialogFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-start lg:pt-24"
      role="dialog"
    >
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        type="button"
      />
      <div className="pb-safe relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white p-5 shadow-2xl lg:max-h-[80dvh] lg:w-[min(92vw,520px)] lg:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            aria-label="닫기"
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function CreateBehaviorDialog({
  onClose,
  onOpenCategoryManager,
}: {
  onClose: () => void;
  onOpenCategoryManager: () => void;
}) {
  const categories = useBehaviorCategoryStore((s) => s.items);
  const add = useBehaviorPoolStore((s) => s.add);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [identityStatement, setIdentityStatement] = useState('');
  const [categoryId, setCategoryId] = useState<BehaviorCategoryId>(() => categories[0]?.id ?? '');
  const [weekdays, setWeekdays] = useState<Set<Weekday>>(new Set());
  const [isRandomRecommended, setIsRandomRecommended] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsRandomRecommended(weekdays.size === 0);
  }, [weekdays]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (categories.some((c) => c.id === categoryId)) return;
    setCategoryId(categories[0]!.id);
  }, [categories, categoryId]);

  const randomToggleDisabled = weekdays.size === 0;
  const randomToggleOnClassName = `rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white${
    randomToggleDisabled ? ' cursor-not-allowed opacity-60' : ''
  }`;

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? categories[0];

  return (
    <DialogFrame onClose={onClose} title="새로운 행동 추가">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            if (!categoryId) throw new Error('카테고리가 필요합니다.');
            const selectedWeekdays = WEEKDAYS.filter((d) => weekdays.has(d));

            add({
              title,
              description,
              identityStatement,
              categoryId,
              weekdays: selectedWeekdays,
              isRandomRecommended,
            });
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : '알 수 없는 오류');
          }
        }}
      >
        <label className="block space-y-1" htmlFor="behavior-title">
          <span className="block text-xs text-gray-500">행동 이름</span>
          <input
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            id="behavior-title"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 물 마시기"
            value={title}
          />
        </label>

        <label className="block space-y-1" htmlFor="behavior-description">
          <span className="block text-xs text-gray-500">설명 (선택)</span>
          <textarea
            className="min-h-[80px] w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            id="behavior-description"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 하루 2L 목표"
            value={description}
          />
        </label>

        <label className="block space-y-1" htmlFor="behavior-identity">
          <span className="block text-xs text-gray-500">
            이 행동을 지속하면 어떤 사람이 될 것 같나요? (선택)
          </span>
          <textarea
            className="min-h-[80px] w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            id="behavior-identity"
            onChange={(e) => setIdentityStatement(e.target.value)}
            placeholder="예: 꾸준히 스스로를 관리하는 사람"
            value={identityStatement}
          />
        </label>

        <label className="block space-y-1" htmlFor="behavior-category">
          <span className="flex items-center justify-between gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              카테고리
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full border border-gray-200"
                style={{ backgroundColor: selectedCategory?.color ?? '#e5e7eb' }}
              />
            </span>
            <button
              aria-label="카테고리 관리"
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              onClick={onOpenCategoryManager}
              type="button"
            >
              +
            </button>
          </span>
          <select
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            id="behavior-category"
            onChange={(e) => setCategoryId(e.target.value as BehaviorCategoryId)}
            value={categoryId}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <legend className="text-xs text-gray-500">요일</legend>
            <div className="flex items-center gap-1">
              <button
                className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setWeekdays(new Set())}
                type="button"
              >
                제한 없음
              </button>
              <button
                className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                onClick={() => setWeekdays(new Set(WEEKDAYS))}
                type="button"
              >
                매일
              </button>
            </div>
          </div>
          {weekdays.size === 0 ? (
            <p className="text-xs text-gray-500">
              요일을 선택하지 않으면 요일 제한 없이 랜덤 추출됩니다.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const checked = weekdays.has(day);
              const id = `weekday-${day}`;

              return (
                <label
                  className={
                    checked
                      ? 'inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700'
                      : 'inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700'
                  }
                  htmlFor={id}
                  key={day}
                >
                  <input
                    checked={checked}
                    className="h-4 w-4 accent-indigo-600"
                    id={id}
                    onChange={() => {
                      setWeekdays((prev) => {
                        const next = new Set(prev);
                        if (next.has(day)) next.delete(day);
                        else next.add(day);
                        return next;
                      });
                    }}
                    type="checkbox"
                  />
                  {WEEKDAY_LABELS[day]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">랜덤 추천</p>
              <p className="mt-1 text-xs text-gray-600">켜면 오늘 행동 랜덤 추출 대상이 됩니다.</p>
            </div>
            <button
              aria-pressed={isRandomRecommended}
              className={
                isRandomRecommended
                  ? randomToggleOnClassName
                  : 'rounded-full bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700'
              }
              disabled={randomToggleDisabled}
              onClick={() => setIsRandomRecommended((prev) => !prev)}
              type="button"
            >
              {isRandomRecommended ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            type="submit"
          >
            추가
          </button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </DialogFrame>
  );
}

function AddTodayDialog({ onClose }: { onClose: () => void }) {
  const poolItems = useBehaviorPoolStore((s) => s.items);
  const existingToday = useTodayBehaviorStore((s) => s.items);

  const existingIds = useMemo(
    () => new Set(existingToday.map((item) => item.behaviorId)),
    [existingToday],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, []);

  const canSubmit = selected.size > 0;

  return (
    <DialogFrame onClose={onClose} title="오늘 행동 추가">
      {poolItems.length === 0 ? (
        <div className="text-sm text-gray-700">
          행동 풀이 비어 있어요. 먼저 새 행동을 추가해 주세요.
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="max-h-[45vh] space-y-2 overflow-auto pr-1">
            {poolItems.map((item) => {
              const checked = selected.has(item.id);
              const alreadyInToday = existingIds.has(item.id);
              const checkboxId = `today-add-${item.id}`;

              return (
                <li
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                  key={item.id}
                >
                  <label className="flex min-w-0 items-center gap-3" htmlFor={checkboxId}>
                    <input
                      checked={checked}
                      className="h-4 w-4"
                      disabled={alreadyInToday}
                      id={checkboxId}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                      type="checkbox"
                    />
                    <span className="truncate text-sm text-gray-900">{item.title}</span>
                  </label>
                  {alreadyInToday ? (
                    <span className="shrink-0 text-xs text-gray-500">이미 추가됨</span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">선택: {selected.size}개</p>
            <button
              className={
                canSubmit
                  ? 'rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500'
                  : 'cursor-not-allowed rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-400'
              }
              disabled={!canSubmit}
              onClick={() => {
                useTodayBehaviorStore.getState().addFromPool([...selected]);
                onClose();
              }}
              type="button"
            >
              오늘에 추가
            </button>
          </div>
        </div>
      )}
    </DialogFrame>
  );
}

function CategoryManagerDialog({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const categories = useBehaviorCategoryStore((s) => s.items);
  const add = useBehaviorCategoryStore((s) => s.add);
  const update = useBehaviorCategoryStore((s) => s.update);

  const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({});
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLabelDrafts((prev) => {
      const next: Record<string, string> = { ...prev };
      const ids = new Set(categories.map((c) => c.id));

      categories.forEach((c) => {
        if (next[c.id] === undefined) next[c.id] = c.label;
      });

      Object.keys(next).forEach((id) => {
        if (!ids.has(id)) delete next[id];
      });

      return next;
    });
  }, [categories]);

  return (
    <DialogFrame onClose={onClose} title="카테고리 관리">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900">전체 카테고리</p>
          <button
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            onClick={onBack}
            type="button"
          >
            돌아가기
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-gray-600">카테고리가 없습니다.</p>
        ) : (
          <ul className="max-h-[45vh] space-y-2 overflow-auto pr-1">
            {categories.map((c) => {
              const colorInputId = `category-color-${c.id}`;

              return (
                <li
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                  key={c.id}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      aria-hidden
                      className="h-3 w-3 shrink-0 rounded-full border border-gray-200"
                      style={{ backgroundColor: c.color }}
                    />
                    <input
                      className="w-full min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      onBlur={() => {
                        update(c.id, { label: labelDrafts[c.id] ?? c.label });
                        const updated =
                          useBehaviorCategoryStore.getState().items.find((item) => item.id === c.id)
                            ?.label ?? c.label;
                        setLabelDrafts((prev) => ({ ...prev, [c.id]: updated }));
                      }}
                      onChange={(e) => {
                        const { value } = e.target;
                        setLabelDrafts((prev) => ({ ...prev, [c.id]: value }));
                      }}
                      value={labelDrafts[c.id] ?? c.label}
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-gray-500">색</span>
                    <input
                      aria-label={`${c.label} 색상`}
                      className="h-9 w-9 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
                      id={colorInputId}
                      onChange={(e) => update(c.id, { color: e.target.value })}
                      type="color"
                      value={c.color}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">카테고리 추가</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
            <input
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: 업무"
              value={label}
            />
            <input
              aria-label="새 카테고리 색상"
              className="h-10 w-10 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
              onChange={(e) => setColor(e.target.value)}
              type="color"
              value={color}
            />
            <button
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              onClick={() => {
                try {
                  add({ label, color });
                  setLabel('');
                  setColor('#6366f1');
                  setError(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : '알 수 없는 오류');
                }
              }}
              type="button"
            >
              추가
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </DialogFrame>
  );
}

export function BehaviorPoolFab() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);

  const closeMenu = () => setMenuOpen(false);
  const closeDialog = () => setDialog(null);

  const openDialog = (kind: Exclude<DialogKind, null>) => {
    setMenuOpen(false);
    setDialog(kind);
  };

  return (
    <>
      {menuOpen ? (
        <button
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-40 bg-transparent"
          onClick={closeMenu}
          type="button"
        />
      ) : null}

      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-50 flex flex-col items-end gap-3 lg:bottom-6">
        {menuOpen ? (
          <div className="w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <button
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => openDialog('today')}
              type="button"
            >
              오늘 행동 추가
            </button>
            <button
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => openDialog('create')}
              type="button"
            >
              새로운 행동 추가
            </button>
          </div>
        ) : null}

        <button
          aria-label="행동 추가 메뉴"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl font-semibold text-white shadow-xl transition-colors hover:bg-indigo-500"
          onClick={() => setMenuOpen((prev) => !prev)}
          type="button"
        >
          {menuOpen ? '×' : '+'}
        </button>
      </div>

      {dialog === 'create' ? (
        <CreateBehaviorDialog
          onClose={closeDialog}
          onOpenCategoryManager={() => setDialog('categories')}
        />
      ) : null}
      {dialog === 'today' ? <AddTodayDialog onClose={closeDialog} /> : null}
      {dialog === 'categories' ? (
        <CategoryManagerDialog onBack={() => setDialog('create')} onClose={closeDialog} />
      ) : null}
    </>
  );
}
