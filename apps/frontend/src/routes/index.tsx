import { useEffect } from 'react';
import { NewGoalPage } from '@/pages/NewGoalPage';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { IndexPage } from '@/pages/IndexPage';
import { AllGoalsPage } from '@/pages/AllGoalsPage';
import { GoalDetailPage } from '@/pages/GoalDetailPage';
import { StatsPage } from '@/pages/StatsPage';
import { LoginPage } from '@/pages/LoginPage';
import useAuthStore from '@/stores/useAuthStore';

function RequireAuth() {
  const location = useLocation();
  const { user, fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user) {
      fetchMe().catch(() => null);
    }
  }, [fetchMe, user]);

  if (isLoading) {
    return <div className="text-label-disable text-center">로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RequireAuth />}>
        <Route element={<IndexPage />} index />
        <Route element={<NewGoalPage />} path="/goals/new" />
        <Route element={<AllGoalsPage />} path="/all-goals" />
        <Route element={<GoalDetailPage />} path="/goals/:goalId" />
        <Route element={<StatsPage />} path="/stats" />
      </Route>
      <Route
        element={<div className="text-label-disable text-center">구현 예정입니다</div>}
        path="*"
      />
    </Routes>
  );
}
