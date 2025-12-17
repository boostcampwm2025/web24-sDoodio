import { APP_NAME } from '@web24/shared';

import { AppRoutes } from '@/routes';
import { useAbcdeStore } from '@/stores/useAbcdeStore';

export function App() {
  const count = useAbcdeStore((s) => s.count);
  const increment = useAbcdeStore((s) => s.increment);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
          <button
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900"
            onClick={increment}
            type="button"
          >
            Count: {count}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
}
