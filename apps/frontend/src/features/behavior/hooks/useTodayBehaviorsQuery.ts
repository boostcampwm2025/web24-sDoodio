import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { fetchTodayBehaviors } from '../apis/fetchBehaviors.api';

export function useTodayBehaviorsQuery(options?: UseQueryOptions<Behavior[], unknown, Behavior[]>) {
  return useQuery<Behavior[], unknown, Behavior[]>({
    queryKey: ['todayBehaviors'],
    queryFn: fetchTodayBehaviors,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
