import { Route, Routes } from 'react-router-dom';

import { BehaviorPoolPage } from '@/pages/BehaviorPoolPage';
import { IndexPage } from '@/pages/IndexPage';
import { StatsPage } from '@/pages/StatsPage';
import BehaviorDetailPage from '@/pages/BahaviorDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<IndexPage />} index />
      <Route element={<BehaviorPoolPage />} path="/all-behaviors" />
      <Route element={<StatsPage />} path="/stats" />
      <Route element={<BehaviorDetailPage />} path="/behavior/:behaviorId" />
      <Route element={<div className="text-zinc-300">Not Found</div>} path="*" />
    </Routes>
  );
}
