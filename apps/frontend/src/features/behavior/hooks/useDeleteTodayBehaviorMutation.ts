import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DeleteTodayBehaviorResponse, TodayBehavior } from '@web24/shared';
import { deleteTodayBehavior } from '../apis/deleteTodayBehavior.api';

export function useDeleteTodayBehaviorMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteTodayBehaviorResponse,
    Error,
    string,
    { previousBehaviors?: TodayBehavior[] }
  >({
    mutationFn: deleteTodayBehavior,

    // 낙관적 업데이트
    onMutate: async (behaviorId) => {
      await queryClient.cancelQueries({
        queryKey: ['todayBehaviors'],
      });

      const previousBehaviors = queryClient.getQueryData<TodayBehavior[]>(['todayBehaviors']);

      queryClient.setQueryData<TodayBehavior[]>(['todayBehaviors'], (old = []) =>
        old.filter((b) => b.id !== behaviorId),
      );

      return { previousBehaviors };
    },

    // 실패 시 롤백
    onError: (_error, _id, context) => {
      if (context?.previousBehaviors) {
        queryClient.setQueryData(['todayBehaviors'], context.previousBehaviors);
      }
    },

    // 성공 시
    onSuccess: ({ id }) => {
      queryClient.setQueryData<TodayBehavior[]>(['todayBehaviors'], (old = []) =>
        old.filter((b) => b.id !== id),
      );
    },

    // 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['todayBehaviors'],
      });
    },
  });
}
