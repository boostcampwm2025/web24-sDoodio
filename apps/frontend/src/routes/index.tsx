import { Route, Routes } from 'react-router-dom';

import { BehaviorPoolPage } from '@/pages/BehaviorPoolPage';
import { IndexPage } from '@/pages/IndexPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<IndexPage />} index />
      <Route element={<BehaviorPoolPage />} path="/all-behaviors" />
      <Route element={<div className="text-zinc-300">Not Found</div>} path="*" />
    </Routes>
  );
}
