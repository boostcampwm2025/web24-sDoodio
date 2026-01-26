import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ensureWebPushSubscribed, useAutoWebPushSubscribe } from './useAutoWebPushSubscribe';
import { registerPushSubscription } from '../apis/registerPushSubscription.api';
import { fetchVapidPublicKey } from '../apis/fetchVapidPublicKey.api';
import { urlBase64ToUint8Array } from '../utils/base64-converter';

vi.mock('../apis/registerPushSubscription.api', () => ({
  registerPushSubscription: vi.fn(),
}));
vi.mock('../apis/fetchVapidPublicKey.api', () => ({
  fetchVapidPublicKey: vi.fn(),
}));
vi.mock('../utils/base64-converter', () => ({
  urlBase64ToUint8Array: vi.fn(),
}));

const createPushSubscriptionMock = (endpoint = 'https://example.com/push'): PushSubscription => ({
  endpoint,
  expirationTime: null,
  options: {} as PushSubscriptionOptions,
  getKey: vi.fn(),
  toJSON: () => ({
    endpoint,
    expirationTime: null,
    keys: {
      p256dh: 'p256dh-key',
      auth: 'auth-key',
    },
  }),
  unsubscribe: vi.fn().mockResolvedValue(true),
});

const setupNotification = (
  permission: NotificationPermission,
  requestResult: NotificationPermission = permission,
) => {
  const requestPermission = vi.fn().mockResolvedValue(requestResult);
  vi.stubGlobal('Notification', {
    permission,
    requestPermission,
  });
  return requestPermission;
};

const setupServiceWorker = (pushManager: Partial<PushManager>) => {
  vi.stubGlobal('navigator', {
    serviceWorker: {
      ready: Promise.resolve({ pushManager }),
    },
  } as Navigator);
};

const enablePushManager = () => {
  class PushManagerMock {}
  vi.stubGlobal('PushManager', PushManagerMock);
};

const flushPromises = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

describe('ensureWebPushSubscribed', () => {
  const registerPushSubscriptionMock = vi.mocked(registerPushSubscription);
  const fetchVapidPublicKeyMock = vi.mocked(fetchVapidPublicKey);
  const urlBase64ToUint8ArrayMock = vi.mocked(urlBase64ToUint8Array);

  beforeEach(() => {
    vi.clearAllMocks();
    registerPushSubscriptionMock.mockResolvedValue({ success: true });
    fetchVapidPublicKeyMock.mockResolvedValue({ publicKey: 'public-key' });
    urlBase64ToUint8ArrayMock.mockReturnValue(new Uint8Array([9, 9, 9]));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serviceWorker 미지원이면 no-sw를 반환한다', async () => {
    vi.stubGlobal('navigator', {} as Navigator);
    enablePushManager();
    setupNotification('granted');

    const result = await ensureWebPushSubscribed({ mode: 'silent' });

    expect(result).toEqual({ ok: false, reason: 'no-sw' });
  });

  it('PushManager 미지원이면 no-push를 반환한다', async () => {
    setupServiceWorker({ getSubscription: vi.fn() });
    setupNotification('granted');

    const result = await ensureWebPushSubscribed({ mode: 'silent' });

    expect(result).toEqual({ ok: false, reason: 'no-push' });
  });

  it('권한이 denied면 중단한다', async () => {
    setupServiceWorker({ getSubscription: vi.fn() });
    enablePushManager();
    setupNotification('denied');

    const result = await ensureWebPushSubscribed({ mode: 'interactive' });

    expect(result).toEqual({ ok: false, reason: 'denied' });
  });

  it('silent 모드에서 권한이 granted가 아니면 중단한다', async () => {
    const getSubscription = vi.fn();
    setupServiceWorker({ getSubscription });
    enablePushManager();
    setupNotification('default');

    const result = await ensureWebPushSubscribed({ mode: 'silent' });

    expect(result).toEqual({ ok: false, reason: 'permission-not-granted' });
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it('silent 모드에서 기존 구독이 있으면 저장한다', async () => {
    const subscription = createPushSubscriptionMock();
    const getSubscription = vi.fn().mockResolvedValue(subscription);
    setupServiceWorker({ getSubscription });
    enablePushManager();
    setupNotification('granted');

    const result = await ensureWebPushSubscribed({ mode: 'silent' });

    expect(registerPushSubscriptionMock).toHaveBeenCalledWith(subscription);
    expect(result).toEqual({ ok: true, action: 'saved-existing' });
  });

  it('interactive 모드에서 권한 요청이 거절되면 중단한다', async () => {
    const getSubscription = vi.fn();
    setupServiceWorker({ getSubscription });
    enablePushManager();
    const requestPermission = setupNotification('default', 'denied');

    const result = await ensureWebPushSubscribed({ mode: 'interactive' });

    expect(requestPermission).toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: 'not-granted' });
  });

  it('interactive 모드에서 새 구독을 생성하고 저장한다', async () => {
    const subscription = createPushSubscriptionMock();
    const getSubscription = vi.fn().mockResolvedValue(null);
    const subscribe = vi.fn().mockResolvedValue(subscription);
    const serverKey = new Uint8Array([9, 9, 9]);
    setupServiceWorker({ getSubscription, subscribe });
    enablePushManager();
    setupNotification('granted');
    urlBase64ToUint8ArrayMock.mockReturnValue(serverKey);

    const result = await ensureWebPushSubscribed({ mode: 'interactive' });

    expect(fetchVapidPublicKeyMock).toHaveBeenCalled();
    expect(urlBase64ToUint8ArrayMock).toHaveBeenCalledWith('public-key');
    expect(subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: serverKey,
    });
    expect(registerPushSubscriptionMock).toHaveBeenCalledWith(subscription);
    expect(result).toEqual({ ok: true, action: 'created-and-saved' });
  });
});

describe('useAutoWebPushSubscribe', () => {
  const registerPushSubscriptionMock = vi.mocked(registerPushSubscription);

  beforeEach(() => {
    vi.clearAllMocks();
    registerPushSubscriptionMock.mockResolvedValue({ success: true });
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('enabled가 false면 실행하지 않는다', () => {
    setupServiceWorker({ getSubscription: vi.fn() });
    enablePushManager();
    const requestPermission = setupNotification('default', 'granted');

    renderHook(() => useAutoWebPushSubscribe({ enabled: false, mode: 'interactive' }));

    expect(sessionStorage.getItem('webpush:auto:interactive')).toBeNull();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('enabled가 true면 한번만 실행하고 sessionStorage에 기록한다', async () => {
    const subscription = createPushSubscriptionMock();
    const getSubscription = vi.fn().mockResolvedValue(subscription);
    setupServiceWorker({ getSubscription });
    enablePushManager();
    setupNotification('granted');

    const { rerender } = renderHook(
      ({ enabled }) => useAutoWebPushSubscribe({ enabled, mode: 'silent' }),
      { initialProps: { enabled: true } },
    );

    await act(async () => {
      await flushPromises();
    });

    expect(sessionStorage.getItem('webpush:auto:silent')).toBe('1');
    expect(registerPushSubscriptionMock).toHaveBeenCalledWith(subscription);

    registerPushSubscriptionMock.mockClear();

    rerender({ enabled: true });

    await act(async () => {
      await flushPromises();
    });

    expect(registerPushSubscriptionMock).not.toHaveBeenCalled();
  });
});
