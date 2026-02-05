import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DomainError } from '@/shared/errors/domain-error';
import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { createGoal } from '../apis/createGoal.api';

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const showToast = useDodoToast();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },

    onError: (error: unknown) => {
      if (error instanceof DomainError) {
        showToast(error.message, { position: 'top' });
      } else {
        showToast('알 수 없는 문제가 생겼네.', { position: 'top' });
      }
    },
  });
}
