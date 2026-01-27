import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';
import { ensureWebPushSubscribed } from '@/features/push/hooks/useAutoWebPushSubscribe';

type LocationState = {
  from?: { pathname: string };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchMe, loginGuest, isLoading, error } = useAuthStore();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  useEffect(() => {
    if (!user) {
      fetchMe().catch(() => null);
    }
  }, [fetchMe, user]);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [from, navigate, user]);

  const handleGuestLogin = async () => {
    await loginGuest();
    await ensureWebPushSubscribed({ mode: 'interactive' }).catch(() => null);
    navigate(from, { replace: true });
  };

  return (
    <div className="bg-bg-normal flex min-h-screen items-center justify-center px-6">
      <div className="bg-bg-light shadow-emphasize w-full max-w-sm rounded-3xl p-8 text-center">
        <h1 className="text-title-2 text-label-normal mb-2">로그인</h1>
        <p className="text-headline-1 text-label-disable mb-6">게스트로 바로 시작할 수 있어요.</p>
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="bg-primary-strong text-bg-light text-headline-1 w-full rounded-2xl py-3 disabled:opacity-50"
        >
          게스트로 로그인
        </button>
        {error ? <p className="text-label-disable mt-4 text-sm">{error}</p> : null}
      </div>
    </div>
  );
}
