import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { fetchTodayBehaviors } from '../apis/fetchBehaviors.api';

export function useTodayBehaviorsQuery(
  userId?: string,
  options?: UseQueryOptions<Behavior[], unknown, Behavior[]>,
) {
  return useQuery<Behavior[], unknown, Behavior[]>({
    queryKey: ['todayBehaviors', userId],
    queryFn: fetchTodayBehaviors,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !!userId && (options?.enabled ?? true),
    ...options,
  });
}
