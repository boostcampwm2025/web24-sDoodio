import { useMemo } from 'react';

import { useBehaviorCategoryStore } from '@/stores/useBehaviorCategoryStore';
import { useBehaviorPoolStore } from '@/stores/useBehaviorPoolStore';

export function BehaviorPoolPage() {
  const items = useBehaviorPoolStore((s) => s.items);
  const categories = useBehaviorCategoryStore((s) => s.items);

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">전체 행동</h2>
        <p className="text-sm text-gray-500">전체 행동 목록</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          행동이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {items.map((item) => {
            const category = categoriesById.get(item.categoryId);
            const label = category?.label ?? item.categoryId;
            const color = category?.color ?? '#9ca3af';

            return (
              <li className="p-4 hover:bg-gray-50" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="inline-block h-2 w-2 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        {label}
                      </span>{' '}
                      · 누적 {item.totalCompletions}회
                    </p>
                    {item.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-gray-600">{item.description}</p>
                    ) : null}
                    {item.identityStatement ? (
                      <p className="mt-2 line-clamp-2 text-xs text-gray-600">
                        {item.identityStatement}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
