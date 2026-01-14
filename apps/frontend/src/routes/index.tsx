import { NewGoalPage } from '@/pages/NewGoalPage';
import { Route, Routes } from 'react-router-dom';
import { IndexPage } from '@/pages/IndexPage';
import { AllGoalsPage } from '@/pages/AllGoalsPage';
import { GoalDetailPage } from '@/pages/GoalDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<IndexPage />} index />
      <Route element={<NewGoalPage />} path="/goals/new" />
      <Route element={<AllGoalsPage />} path="/all-goals" />
      <Route element={<GoalDetailPage />} path="/goals/:goalId" />
      <Route element={<div className="text-label-disable">Not Found</div>} path="*" />
    </Routes>
  );
}
