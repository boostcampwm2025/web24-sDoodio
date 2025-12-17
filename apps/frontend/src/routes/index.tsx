import { Route, Routes } from 'react-router-dom';

import { DodoRoom } from '@/features/dodoroom/components/DodoRoom';
import { AuthRoutes } from './auth.routes';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DodoRoom />} index />
      <Route element={<AuthRoutes />} path="/auth/*" />
      <Route element={<div className="text-zinc-300">Not Found</div>} path="*" />
    </Routes>
  );
}
