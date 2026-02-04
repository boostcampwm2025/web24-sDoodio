import { useEffect, useState } from 'react';
import { NewGoalPage } from '@/pages/NewGoalPage';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { IndexPage } from '@/pages/IndexPage';
import { AllGoalsPage } from '@/pages/AllGoalsPage';
import { GoalDetailPage } from '@/pages/GoalDetailPage';
import { StatsPage } from '@/pages/StatsPage';
import { DodoRoomPage } from '@/pages/DodoRoomPage';
import { LoginPage } from '@/pages/LoginPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { MyPage } from '@/pages/MyPage';
import useAuthStore from '@/stores/useAuthStore';
import Layout from '@/shared/components/layout/Layout';

function RequireAuth() {
  const location = useLocation();
  const { user, fetchMe, isLoading } = useAuthStore();
  const [hasUserChecked, setHasUserChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchMe()
        .catch(() => null)
        .finally(() => setHasUserChecked(true));
      return;
    }
    setHasUserChecked(true);
  }, [fetchMe, user]);

  if (!hasUserChecked || isLoading) {
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
      {/* 레이아웃 미포함 페이지 */}
      <Route element={<OnboardingPage />} path="/onboarding" />
      <Route element={<LoginPage />} path="/login" />
      {/* 레이아웃 포함 페이지 */}
      <Route element={<Layout />}>
        <Route element={<RequireAuth />}>
          <Route element={<IndexPage />} index />
          <Route element={<NewGoalPage />} path="/goals/new" />
          <Route element={<AllGoalsPage />} path="/all-goals" />
          <Route element={<GoalDetailPage />} path="/goals/:goalId" />
          <Route element={<StatsPage />} path="/stats" />
          <Route element={<DodoRoomPage />} path="/dodo-room" />
          <Route element={<MyPage />} path="/mypage" />
        </Route>
        <Route
          element={<div className="text-label-disable text-center">구현 예정입니다</div>}
          path="*"
        />
      </Route>
    </Routes>
  );
}
