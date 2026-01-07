import { Route, Routes } from 'react-router-dom';
import { IndexPage } from '@/pages/IndexPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<IndexPage />} index />
      <Route element={<div className="text-label-disable">Not Found</div>} path="*" />
    </Routes>
  );
}
