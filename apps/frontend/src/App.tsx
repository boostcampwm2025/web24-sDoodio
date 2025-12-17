import { APP_NAME } from '@web24/shared';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '@/routes';

export function App() {

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => navigator.serviceWorker.register('/dev-sw.js?dev-sw'))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
          <Link className="text-sm text-zinc-300 hover:underline" to="/push">
              Push
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
}
