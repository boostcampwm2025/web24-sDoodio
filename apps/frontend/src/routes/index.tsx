import { Route, Routes } from 'react-router-dom';
import { IndexPage } from '@/pages/IndexPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<IndexPage />} index />
      {/* 목표 생성 컴포넌트 연결 필요 */}
      <Route element={<div>목표 생성 페이지</div>} path="/goals/new" />
      <Route element={<div className="text-label-disable">Not Found</div>} path="*" />
    </Routes>
  );
}
