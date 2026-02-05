import { useEffect, useRef } from 'react';
import { registerPushSubscription } from '../apis/registerPushSubscription.api';
import { fetchVapidPublicKey } from '../apis/fetchVapidPublicKey.api';
import { urlBase64ToUint8Array } from '../utils/base64-converter';

type EnsureMode = 'interactive' | 'silent';

export async function ensureWebPushSubscribed(params: { mode: EnsureMode }) {
  const { mode } = params;

  if (!('serviceWorker' in navigator)) return { ok: false, reason: 'no-sw' } as const;
  if (!('PushManager' in globalThis)) return { ok: false, reason: 'no-push' } as const;

  // denied면 끝
  if (Notification.permission === 'denied') {
    return { ok: false, reason: 'denied' } as const;
  }

  const reg = await navigator.serviceWorker.ready;

  // ===== silent (자동 로그인) =====
  // 팝업 X, 구독 생성 X
  // 단, 권한 granted + 기존 구독이 있으면 서버 저장(업서트)만 조용히 시도
  if (mode === 'silent') {
    if (Notification.permission !== 'granted') {
      return { ok: false, reason: 'permission-not-granted' } as const;
    }

    const existing = await reg.pushManager.getSubscription();
    if (!existing) {
      return { ok: false, reason: 'no-existing-subscription' } as const;
    }

    await registerPushSubscription(existing);
    return { ok: true, action: 'saved-existing' as const };
  }

  // ===== interactive (버튼 로그인 등) =====
  // default면 팝업 요청 → granted면 구독 생성/재사용 → 서버 저장
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: 'not-granted' } as const;
  }

  // 여기까지 오면 granted
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array((await fetchVapidPublicKey()).publicKey),
    }));

  await registerPushSubscription(sub);

  return {
    ok: true,
    action: existing ? ('saved-existing' as const) : ('created-and-saved' as const),
  };
}

export function useAutoWebPushSubscribe(params: {
  enabled: boolean; // user 존재 여부 등
  mode: 'silent' | 'interactive';
  sessionKey?: string; // 세션 중복 방지 키
}) {
  const { enabled, mode, sessionKey = `webpush:auto:${mode}` } = params;
  const ranRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (ranRef.current) return;

    if (sessionStorage.getItem(sessionKey) === '1') return;

    ranRef.current = true;
    sessionStorage.setItem(sessionKey, '1');

    ensureWebPushSubscribed({ mode }).catch(() => null);
  }, [enabled, mode, sessionKey]);
}
