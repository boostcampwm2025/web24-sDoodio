import { useMutation, useQueryClient } from '@tanstack/react-query';
import { refreshTodayBehaviors } from '../apis/refreshTodayBehaviors.api';

export function useRefreshTodayBehaviorsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshTodayBehaviors,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todayBehaviors'],
      });
    },
  });
}
