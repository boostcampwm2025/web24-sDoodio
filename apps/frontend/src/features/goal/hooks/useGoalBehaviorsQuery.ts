import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Behavior } from '@web24/shared';
import { fetchGoalBehaviors } from '../apis/fetchGoalBehaviors.api';

export function useGoalBehaviorsQuery(
  goalId: string,
  enabled: boolean = true,
  options?: UseQueryOptions<Behavior[], unknown, Behavior[]>,
) {
  return useQuery<Behavior[], unknown, Behavior[]>({
    queryKey: ['goalBehaviors', goalId],
    queryFn: () => fetchGoalBehaviors(goalId),
    enabled: !!goalId && enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
