import { useQuery } from '@tanstack/react-query';
import { fetchGoal } from '../apis/fetchGoal.api';

export function useGoalQuery(goalId: string) {
  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => fetchGoal(goalId),
    enabled: !!goalId,
  });
}
