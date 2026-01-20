import { create } from 'zustand';
import { DEFAULT, REWARD_LINES } from '@/features/goal/constants/dodo';

const DEFAULT_QUOTE = DEFAULT;

interface DodoChatState {
  quote: string;
  isFirstStampToday: boolean;
  setQuote: (quote: string) => void;
  setRewardQuote: (goalTitle: string) => void;
  resetQuote: () => void;
  showFirstStampOverlay: () => void;
  hideFirstStampOverlay: () => void;
}

const useDodoChatStore = create<DodoChatState>((set) => ({
  quote: DEFAULT_QUOTE,
  isFirstStampToday: false,
  setQuote: (quote) => set({ quote }),
  setRewardQuote: (goalTitle) => {
    const lines = REWARD_LINES[goalTitle] || REWARD_LINES.default;
    const randomIndex = Math.floor(Math.random() * lines.length);
    set({ quote: lines[randomIndex] });
  },
  resetQuote: () => set({ quote: DEFAULT_QUOTE }),
  showFirstStampOverlay: () => set({ isFirstStampToday: true }),
  hideFirstStampOverlay: () => set({ isFirstStampToday: false }),
}));

export default useDodoChatStore;
