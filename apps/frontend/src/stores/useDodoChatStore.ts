import { create } from 'zustand';

const DEFAULT_QUOTE = '완벽하지 않아도 일단 해보면 재미있을거에요!';

interface DodoChatState {
  quote: string;
  quotes: string[];
  isFirstStampToday: boolean;
  setQuote: (quote: string) => void;
  setRandomQuote: () => void;
  resetQuote: () => void;
  showFirstStampOverlay: () => void;
  hideFirstStampOverlay: () => void;
}

const useDodoChatStore = create<DodoChatState>((set, get) => ({
  quote: DEFAULT_QUOTE,
  quotes: ['오늘도 하나 해냈어요!', '대단해요!'],
  isFirstStampToday: false,
  setQuote: (quote) => set({ quote }),
  setRandomQuote: () => {
    const { quotes, quote: currentQuote } = get();
    const availableQuotes = quotes.filter((q) => q !== currentQuote);
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    set({ quote: availableQuotes[randomIndex] });
  },
  resetQuote: () => set({ quote: DEFAULT_QUOTE }),
  showFirstStampOverlay: () => set({ isFirstStampToday: true }),
  hideFirstStampOverlay: () => set({ isFirstStampToday: false }),
}));

export default useDodoChatStore;
