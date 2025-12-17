import { Route, Routes } from 'react-router-dom';

function LoginPage() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-base font-semibold">Login</h2>
      <p className="mt-2 text-sm text-zinc-300">Placeholder auth route.</p>
    </div>
  );
}

export function AuthRoutes() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="login" />
      <Route element={<div className="text-zinc-300">Auth Not Found</div>} path="*" />
    </Routes>
  );
}
