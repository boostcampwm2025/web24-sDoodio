import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT, REWARD_LINES } from '@/features/goal/constants/dodo';
import useDodoChatStore from './useDodoChatStore';

const DEFAULT_QUOTE = DEFAULT;

describe('useDodoChatStore', () => {
  beforeEach(() => {
    useDodoChatStore.setState({
      quote: DEFAULT_QUOTE,
      isFirstStampToday: false,
    });
  });

  it('초기 상태를 가진다', () => {
    const state = useDodoChatStore.getState();

    expect(state.quote).toBe(DEFAULT_QUOTE);
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

  it('setRewardQuote는 올바른 칭찬 대사를 설정한다', () => {
    const { setRewardQuote } = useDodoChatStore.getState();
    setRewardQuote('goal-template-1');

    const newQuote = useDodoChatStore.getState().quote;
    expect(REWARD_LINES['goal-template-1']).toContain(newQuote);
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
