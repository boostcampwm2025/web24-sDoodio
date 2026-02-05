import { useQuery } from '@tanstack/react-query';
import { fetchGoalBehaviors } from '../apis/fetchGoalBehaviors.api';

export function useGoalBehaviorsDetailQuery(goalId: string) {
  return useQuery({
    queryKey: ['goalBehaviors', goalId],
    queryFn: () => fetchGoalBehaviors(goalId),
    enabled: !!goalId,
  });
}
