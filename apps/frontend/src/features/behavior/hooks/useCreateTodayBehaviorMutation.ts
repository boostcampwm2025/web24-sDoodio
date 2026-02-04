import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createTodayBehavior } from '../apis/createTodayBehavior.api';

export function useCreateTodayBehaviorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodayBehavior,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayBehaviors'] });
    },

    onError: (error) => {
      const message = error instanceof Error ? error.message.toLowerCase() : '';

      if (message.includes('already')) {
        toast('이미 존재합니다.');
      } else {
        toast('오늘 행동을 추가하지 못했어요.');
      }
    },
  });
}
