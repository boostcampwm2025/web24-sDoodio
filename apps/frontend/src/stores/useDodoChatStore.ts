import { create } from 'zustand';
import { DEFAULT, REWARD_LINES } from '@/features/goal/constants/dodo';

const DEFAULT_QUOTE = DEFAULT;

interface DodoChatState {
  quote: string;
  quotes: string[];
  isFirstStampToday: boolean;
  setQuote: (quote: string) => void;
  setRandomQuote: () => void;
  setRewardQuote: (goalTitle: string) => void;
  resetQuote: () => void;
  showFirstStampOverlay: () => void;
  hideFirstStampOverlay: () => void;
}

const useDodoChatStore = create<DodoChatState>((set, get) => ({
  quote: DEFAULT_QUOTE,
  quotes: ['오늘도 한 걸음 내딛었어!', '정말 잘하고 있어!'],
  isFirstStampToday: false,
  setQuote: (quote) => set({ quote }),
  setRandomQuote: () => {
    const { quotes, quote: currentQuote } = get();
    const availableQuotes = quotes.filter((q) => q !== currentQuote);
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    set({ quote: availableQuotes[randomIndex] });
  },
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
