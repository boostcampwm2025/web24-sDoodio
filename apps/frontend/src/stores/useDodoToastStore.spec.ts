import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_TOAST_DURATION } from '@/features/goal/constants/dodo';
import useDodoToastStore from './useDodoToastStore';

describe('useDodoToastStore', () => {
  beforeEach(() => {
    useDodoToastStore.setState({ toasts: [] });
  });

  it('초기 상태는 비어 있어야 한다', () => {
    const { toasts } = useDodoToastStore.getState();
    expect(toasts).toEqual([]);
  });

  it('showToast는 새로운 토스트를 추가해야 한다', () => {
    const { showToast } = useDodoToastStore.getState();
    showToast('테스트 메시지', DEFAULT_TOAST_DURATION, 'top');

    const { toasts } = useDodoToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toEqual({
      id: expect.any(String),
      message: '테스트 메시지',
      position: 'top',
      duration: DEFAULT_TOAST_DURATION,
    });
  });

  it('동일한 위치에 showToast 호출 시 기존 토스트를 업데이트해야 한다', () => {
    const { showToast } = useDodoToastStore.getState();

    // 첫 번째 토스트 추가
    showToast('첫 번째 메시지', DEFAULT_TOAST_DURATION, 'top');
    const { toasts: initialToasts } = useDodoToastStore.getState();
    const firstId = initialToasts[0].id;

    // 동일 위치에 두 번째 토스트 추가
    showToast('두 번째 메시지', DEFAULT_TOAST_DURATION, 'top');

    const { toasts } = useDodoToastStore.getState();

    // 토스트는 하나만 있어야 함
    expect(toasts).toHaveLength(1);

    // ID는 동일해야 함 (기존 토스트 업데이트)
    expect(toasts[0].id).toBe(firstId);

    // 메시지는 업데이트되어야 함
    expect(toasts[0].message).toBe('두 번째 메시지');
  });

  it('다른 위치에 showToast 호출 시 새로운 토스트가 추가되어야 한다', () => {
    const { showToast } = useDodoToastStore.getState();

    showToast('상단 메시지', DEFAULT_TOAST_DURATION, 'top');
    showToast('하단 메시지', DEFAULT_TOAST_DURATION, 'bottom');

    const { toasts } = useDodoToastStore.getState();
    expect(toasts).toHaveLength(2);
  });

  it('removeToast는 특정 ID의 토스트를 제거해야 한다', () => {
    const { showToast, removeToast } = useDodoToastStore.getState();
    showToast('테스트 메시지', DEFAULT_TOAST_DURATION, 'top');

    const { toasts: toastsBefore } = useDodoToastStore.getState();
    const { id } = toastsBefore[0];

    removeToast(id);

    const { toasts } = useDodoToastStore.getState();
    expect(toasts).toHaveLength(0);
  });
});
