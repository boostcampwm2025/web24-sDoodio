import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetGoalsResponse, UpdateGoalRequest } from '@web24/shared';
import { updateGoal } from '../apis/updateGoal.api';

export function useUpdateGoalMutation(goalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGoalRequest) => updateGoal(goalId, payload),
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData(['goal', goalId], updatedGoal);
      queryClient.setQueryData<GetGoalsResponse>(['goals'], (prev) => {
        if (!prev) return prev;

        return prev.map((goal) =>
          goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal,
        );
      });
      queryClient.invalidateQueries({ queryKey: ['todayBehaviors'] });
    },
  });
}
