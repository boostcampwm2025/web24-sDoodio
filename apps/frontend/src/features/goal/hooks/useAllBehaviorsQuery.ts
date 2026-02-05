import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { Behavior } from '@web24/shared';
import { fetchAllBehaviors } from '../apis/fetchAllBehaviors.api';

export function useAllBehaviorsQuery(
  isAllExpanded: boolean,
  options?: UseQueryOptions<Behavior[], unknown, Behavior[]>,
) {
  return useQuery<Behavior[], unknown, Behavior[]>({
    queryKey: ['allBehaviors', { isAllExpanded }],
    queryFn: () => fetchAllBehaviors(),
    enabled: isAllExpanded,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
