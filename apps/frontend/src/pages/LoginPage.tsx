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
      const target = user.kind === 'guest' ? '/onboarding' : from;
      navigate(target, { replace: true });
    }
  }, [from, navigate, user]);

  const handleGuestLogin = async () => {
    await loginGuest();
    await ensureWebPushSubscribed({ mode: 'interactive' }).catch(() => null);
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="bg-bg-normal flex min-h-screen items-center justify-center px-6">
      <div className="bg-bg-light shadow-emphasize w-full max-w-sm rounded-3xl p-8 text-center">
        <h1 className="text-title-2 text-label-normal mb-2">로그인</h1>
        <p className="text-headline-1 text-label-disable mb-6">다양한 방식으로 시작할 수 있어요.</p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              globalThis.location.href = '/api/auth/google';
            }}
            disabled={isLoading}
            className="text-headline-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4285F4] py-3 text-white disabled:opacity-50"
          >
            {/* Google 로고 */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="bg-bg-normal text-label-normal text-headline-1 w-full rounded-2xl py-3 shadow-sm disabled:opacity-50"
          >
            게스트로 시작하기
          </button>
        </div>
        {error ? <p className="text-status-danger mt-4 text-sm">{error}</p> : null}
      </div>
    </div>
  );
}
