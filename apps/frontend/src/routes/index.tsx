import { Route, Routes } from 'react-router-dom';

import { IndexPage } from '@/pages/IndexPage';
import { PushDebug } from '@/features/push/components/PushDebug';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<IndexPage />} index />
      <Route element={<PushDebug />} path="/push" />
      <Route element={<div className="text-zinc-300">Not Found</div>} path="*" />
    </Routes>
  );
}
