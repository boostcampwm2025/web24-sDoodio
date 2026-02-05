import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGoalBehaviors } from '../apis/deleteGoalBehaviors.api';

export function useDeleteGoalBehaviors() {
  const queryClient = useQueryClient();
  const showToast = useDodoToast();

  return useMutation({
    mutationFn: ({ goalId, behaviorIds }: { goalId: string; behaviorIds: string[] }) =>
      deleteGoalBehaviors(goalId, behaviorIds),

    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goalBehaviors', goalId] });
    },

    onError: () => {
      showToast('행동을 삭제하지 못했어');
    },
  });
}
