import { useEffect, useState, lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';
import Layout from '@/shared/components/layout/Layout';

// 페이지 컴포넌트 Lazy Loading
const IndexPage = lazy(() => import('@/pages/IndexPage').then((m) => ({ default: m.IndexPage })));
const NewGoalPage = lazy(() =>
  import('@/pages/NewGoalPage').then((m) => ({ default: m.NewGoalPage })),
);
const AllGoalsPage = lazy(() =>
  import('@/pages/AllGoalsPage').then((m) => ({ default: m.AllGoalsPage })),
);
const GoalDetailPage = lazy(() =>
  import('@/pages/GoalDetailPage').then((m) => ({ default: m.GoalDetailPage })),
);
const StatsPage = lazy(() => import('@/pages/StatsPage').then((m) => ({ default: m.StatsPage })));
const DodoRoomPage = lazy(() =>
  import('@/pages/DodoRoomPage').then((m) => ({ default: m.DodoRoomPage })),
);
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const OnboardingPage = lazy(() =>
  import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const MyPage = lazy(() => import('@/pages/MyPage').then((m) => ({ default: m.MyPage })));

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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-label-disable">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-label-disable">페이지를 불러오고 있습니다...</div>
        </div>
      }
    >
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
            element={<div className="text-label-disable p-10 text-center">구현 예정입니다</div>}
            path="*"
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
