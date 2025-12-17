import { useEffect, useRef, useState } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function ensureServiceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return navigator.serviceWorker.register('/dev-sw.js?dev-sw');
  }
}

export function PushDebug() {
  const pushServerUrl = (import.meta.env.VITE_PUSH_SERVER_URL?.toString() ??
    window.location.origin) as string;

  const { isSecureContext } = window;
  const supportsNotifications = 'Notification' in window;
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsPushManager = 'PushManager' in window;

  const canUsePush =
    supportsNotifications && supportsServiceWorker && supportsPushManager && isSecureContext;

  const [status, setStatus] = useState<string>('');
  const [permission, setPermission] = useState<string>(() => {
    if (!supportsNotifications) return 'unsupported';
    return Notification.permission;
  });
  const [subscriptionJson, setSubscriptionJson] = useState<string>('');
  const [isWorking, setIsWorking] = useState(false);

  const hasInitializedRef = useRef(false);

  async function fetchAndSaveSubscription(subscription: PushSubscription) {
    const response = await fetch(`${pushServerUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    });
    if (!response.ok) throw new Error(`Failed to save subscription: ${response.status}`);
    setSubscriptionJson(JSON.stringify(subscription.toJSON(), null, 2));
  }

  async function requestPermission() {
    try {
      if (!supportsNotifications) {
        setStatus('This browser does not support Notification API.');
        setPermission('unsupported');
        return;
      }

      const result = await Notification.requestPermission();
      setPermission(result);
      setStatus(result === 'granted' ? 'Permission granted.' : `Permission: ${result}`);
    } catch (error) {
      setStatus(
        `Permission request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function subscribe() {
    if (!canUsePush) {
      setStatus(
        'Push is not available (need Notification + Service Worker + Push API + secure context).',
      );
      return;
    }
    if (permission !== 'granted') {
      setStatus(`Notification permission is not granted: ${permission}`);
      return;
    }
    if (isWorking) return;

    setIsWorking(true);
    const run = async () => {
      let step = 'init';
      try {
        step = 'register-sw';
        setStatus('Registering service worker…');
        const registration = await ensureServiceWorkerRegistration();

        step = 'get-subscription';
        setStatus('Checking existing subscription…');
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          step = 'save-existing';
          setStatus('Saving subscription on server…');
          await fetchAndSaveSubscription(existing);
          setStatus('Subscribed (existing) and saved on server.');
          return;
        }

        step = 'fetch-vapid';
        setStatus('Fetching VAPID public key…');
        const keyResponse = await fetch(`${pushServerUrl}/vapid/public-key`);
        if (!keyResponse.ok) {
          setStatus(`Failed to fetch VAPID public key: ${keyResponse.status}`);
          return;
        }
        const { publicKey } = (await keyResponse.json()) as { publicKey: string };
        step = 'decode-vapid';
        const applicationServerKey = urlBase64ToUint8Array(publicKey);

        step = 'subscribe';
        setStatus('Subscribing…');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        step = 'save-new';
        setStatus('Saving subscription on server…');
        await fetchAndSaveSubscription(subscription);
        setStatus('Subscribed and saved on server.');
      } catch (error) {
        const errorName =
          error && typeof error === 'object' && 'name' in error
            ? String((error as { name: unknown }).name)
            : 'Error';
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error);
        setStatus(`Subscribe failed (step=${step}): ${errorName}: ${errorMessage}`);
      } finally {
        setIsWorking(false);
      }
    };

    run().catch((error) => {
      const errorName =
        error && typeof error === 'object' && 'name' in error
          ? String((error as { name: unknown }).name)
          : 'Error';
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: unknown }).message)
          : String(error);
      setStatus(`Subscribe failed (unhandled): ${errorName}: ${errorMessage}`);
      setIsWorking(false);
    });
  }

  async function resetPermission() {
    if (!supportsServiceWorker || !supportsPushManager) {
      setStatus('This browser does not support Service Worker / Push API.');
      return;
    }
    if (isWorking) return;

    setIsWorking(true);
    const run = async () => {
      try {
        setStatus('Unsubscribing…');
        const registration = await ensureServiceWorkerRegistration();
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await existing.unsubscribe();
        }
        setSubscriptionJson('');

        if (supportsNotifications) setPermission(Notification.permission);

        setStatus(
          'Unsubscribed. Note: Notification permission cannot be reset programmatically; change it in browser/site settings.',
        );
      } catch (error) {
        setStatus(`Reset failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsWorking(false);
      }
    };

    run().catch((error) => {
      setStatus(`Reset failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsWorking(false);
    });
  }

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (!supportsNotifications) {
      setStatus('This browser does not support Notification API.');
      return;
    }

    if (Notification.permission === 'default') {
      setStatus('Notifications are not enabled yet. Tap the button to allow.');
    }
  }, [supportsNotifications]);

  useEffect(() => {
    if (!supportsNotifications) return;
    setPermission(Notification.permission);
  }, [supportsNotifications]);

  return (
    <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Web Push (Prototype)</h2>
        <p className="text-sm text-zinc-400">
          Server: <span className="font-mono text-zinc-300">{pushServerUrl}</span>
        </p>
        <p className="text-sm text-zinc-400">
          Permission: <span className="font-mono text-zinc-300">{permission}</span>
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 disabled:opacity-50"
          disabled={!supportsNotifications || isWorking}
          onClick={requestPermission}
          type="button"
        >
          권한 받기
        </button>
        <button
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 disabled:opacity-50"
          disabled={!canUsePush || permission !== 'granted' || isWorking}
          onClick={subscribe}
          type="button"
        >
          구독하기
        </button>
        <button
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-200 disabled:opacity-50"
          disabled={!supportsServiceWorker || !supportsPushManager || isWorking}
          onClick={resetPermission}
          type="button"
        >
          권한 초기화하기
        </button>
      </div>

      {permission === 'denied' ? (
        <p className="text-sm text-zinc-300">
          Notifications are blocked. Please allow notifications in browser/site settings and reload.
        </p>
      ) : null}

      {!canUsePush ? (
        <p className="text-sm text-zinc-300">
          Push not available (need Notification + Service Worker + Push API + secure context).
        </p>
      ) : null}

      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Current Subscription</h3>
        <pre className="overflow-auto rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-200">
          {subscriptionJson || '(none)'}
        </pre>
      </div>
    </section>
  );
}
