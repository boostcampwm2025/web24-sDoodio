import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Behavior } from '@web24/shared';
import { updateGoalBehaviors } from '../apis/updateGoalBehaviors.api';

export function useUpdateGoalBehaviors() {
  const queryClient = useQueryClient();
  const showToast = useDodoToast();

  return useMutation({
    mutationFn: ({ goalId, behaviors }: { goalId: string; behaviors: Behavior[] }) =>
      updateGoalBehaviors(goalId, behaviors),

    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goalBehaviors', goalId] });
    },

    onError: () => {
      showToast('행동을 수정하지 못했어');
    },
  });
}
