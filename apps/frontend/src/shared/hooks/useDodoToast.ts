import useDodoToastStore from '@/stores/useDodoToastStore';
import type { ToastPosition } from '@/shared/components/DodoToast';

export function useDodoToast() {
  const { showToast } = useDodoToastStore();

  return (message: string, options?: { duration?: number; position?: ToastPosition }) => {
    showToast(message, options?.duration, options?.position);
  };
}
