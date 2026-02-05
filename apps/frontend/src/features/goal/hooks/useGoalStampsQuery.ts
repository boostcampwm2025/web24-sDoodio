import { useQuery } from '@tanstack/react-query';
import { fetchGoalStamps } from '../apis/fetchGoalStamps.api';

export function useGoalStampsQuery(goalId: string) {
  return useQuery({
    queryKey: ['goalStamps', goalId],
    queryFn: () => fetchGoalStamps(goalId),
    enabled: !!goalId,
  });
}
