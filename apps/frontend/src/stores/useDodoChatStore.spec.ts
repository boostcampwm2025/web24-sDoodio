import { describe, it, expect, beforeEach } from 'vitest';
import useDodoChatStore from './useDodoChatStore';

const DEFAULT_QUOTE = '완벽하지 않아도 일단 해보면 재미있을거에요!';

describe('useDodoChatStore', () => {
  beforeEach(() => {
    useDodoChatStore.setState({
      quote: DEFAULT_QUOTE,
      quotes: ['오늘도 하나 해냈어요!', '대단해요!'],
      isFirstStampToday: false,
    });
  });

  it('초기 상태를 가진다', () => {
    const state = useDodoChatStore.getState();

    expect(state.quote).toBe(DEFAULT_QUOTE);
    expect(state.quotes.length).toBe(2);
    expect(state.isFirstStampToday).toBe(false);
  });

  it('setQuote는 quote를 변경한다', () => {
    const { setQuote } = useDodoChatStore.getState();

    setQuote('새로운 문구');

    expect(useDodoChatStore.getState().quote).toBe('새로운 문구');
  });

  it('resetQuote는 기본 문구로 되돌린다', () => {
    const { setQuote, resetQuote } = useDodoChatStore.getState();

    setQuote('임시 문구');
    resetQuote();

    expect(useDodoChatStore.getState().quote).toBe(DEFAULT_QUOTE);
  });

  it('setRandomQuote는 현재 quote와 다른 문구로 설정한다', () => {
    const { setRandomQuote } = useDodoChatStore.getState();
    const currentQuote = useDodoChatStore.getState().quote;

    setRandomQuote();

    const newQuote = useDodoChatStore.getState().quote;

    expect(newQuote).not.toBe(currentQuote);
    expect(['오늘도 하나 해냈어요!', '대단해요!']).toContain(newQuote);
  });

  it('showFirstStampOverlay는 isFirstStampToday를 true로 설정한다', () => {
    const { showFirstStampOverlay } = useDodoChatStore.getState();

    showFirstStampOverlay();

    expect(useDodoChatStore.getState().isFirstStampToday).toBe(true);
  });

  it('hideFirstStampOverlay는 isFirstStampToday를 false로 설정한다', () => {
    const { showFirstStampOverlay, hideFirstStampOverlay } = useDodoChatStore.getState();

    showFirstStampOverlay();
    hideFirstStampOverlay();

    expect(useDodoChatStore.getState().isFirstStampToday).toBe(false);
  });
});
