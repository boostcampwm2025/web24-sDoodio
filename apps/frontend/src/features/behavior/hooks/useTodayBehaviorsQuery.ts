import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { TodayBehavior } from '@web24/shared';
import { fetchTodayBehaviors } from '../apis/fetchBehaviors.api';

export function useTodayBehaviorsQuery(
  options?: UseQueryOptions<TodayBehavior[], unknown, TodayBehavior[]>,
) {
  return useQuery<TodayBehavior[], unknown, TodayBehavior[]>({
    queryKey: ['todayBehaviors'],
    queryFn: fetchTodayBehaviors,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
