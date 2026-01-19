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
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastConfig = { id, message, duration, position };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
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
