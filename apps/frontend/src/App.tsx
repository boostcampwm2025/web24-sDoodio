import { APP_NAME } from '@web24/shared';

import { AppRoutes } from '@/routes';

export function App() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
}
