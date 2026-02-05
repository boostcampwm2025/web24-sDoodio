import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchGoals } from '@/features/goal/apis/fetchGoals.api';
import type { GetGoalsResponse } from '@web24/shared';

export function useGoalsQuery(
  options?: UseQueryOptions<GetGoalsResponse, unknown, GetGoalsResponse>,
) {
  return useQuery<GetGoalsResponse, unknown, GetGoalsResponse>({
    queryKey: ['goals'],
    queryFn: fetchGoals,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
