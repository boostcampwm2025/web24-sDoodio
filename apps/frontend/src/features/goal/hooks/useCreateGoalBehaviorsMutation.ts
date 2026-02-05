import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Behavior } from '@web24/shared';
import { createGoalBehaviors } from '../apis/createGoalBehaviors.api';

export function useCreateGoalBehaviors() {
  const queryClient = useQueryClient();
  const showToast = useDodoToast();

  return useMutation({
    mutationFn: ({ goalId, behaviors }: { goalId: string; behaviors: Omit<Behavior, 'id'>[] }) =>
      createGoalBehaviors(goalId, behaviors),

    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goalBehaviors', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },

    onError: () => {
      showToast('행동을 추가하지 못했어');
    },
  });
}
