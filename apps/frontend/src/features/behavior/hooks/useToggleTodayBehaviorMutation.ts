import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TodayBehavior } from '@web24/shared';
import { updateTodayBehaviorStatus } from '../apis/updateTodayBehaviorStatus.api';

interface ToggleBehaviorVars {
  id: string;
  nextStatus: 'pending' | 'completed' | 'skipped' | 'ignored' | 'deleted';
}

interface ToggleBehaviorResult {
  id: string;
  status: ToggleBehaviorVars['nextStatus'];
}

export function useToggleTodayBehaviorMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleBehaviorResult,
    Error,
    ToggleBehaviorVars,
    { previous?: TodayBehavior[] }
  >({
    mutationFn: ({ id, nextStatus }) => updateTodayBehaviorStatus(id, nextStatus),

    onMutate: async ({ id, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['todayBehaviors'] });

      const previous = queryClient.getQueryData<TodayBehavior[]>(['todayBehaviors']);

      queryClient.setQueryData<TodayBehavior[]>(['todayBehaviors'], (old = []) =>
        old.map((b) => (b.id === id ? { ...b, isChecked: nextStatus === 'completed' } : b)),
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['todayBehaviors'], ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBehaviors'] });
    },
  });
}
