import { create } from 'zustand';
import type { ToastPosition } from '@/shared/components/DodoToast';

interface ToastConfig {
  id: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
}

interface DodoToastState {
  toasts: ToastConfig[];
  showToast: (message: string, duration?: number, position?: ToastPosition) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const useDodoToastStore = create<DodoToastState>((set) => ({
  toasts: [],

  showToast: (message, duration = 3000, position = 'bottom') => {
    set((state) => {
      // 이미 같은 위치에 토스트가 있다면 업데이트
      const existingIndex = state.toasts.findIndex((t) => t.position === position);

      if (existingIndex !== -1) {
        const newToasts = [...state.toasts];
        newToasts[existingIndex] = {
          ...newToasts[existingIndex],
          message,
          duration,
        };
        return { toasts: newToasts };
      }

      // 새 토스트 추가
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastConfig = { id, message, duration, position };
      return { toasts: [...state.toasts, newToast] };
    });
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

export default useDodoToastStore;
