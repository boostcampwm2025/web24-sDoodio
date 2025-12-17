import { create } from 'zustand';

type AbcdeState = {
  count: number;
  increment: () => void;
};

export const useAbcdeStore = create<AbcdeState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
