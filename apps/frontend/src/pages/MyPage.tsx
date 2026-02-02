import useAuthStore from '@/stores/useAuthStore';

export function MyPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 pt-10 pb-20 duration-500">
      <h1 className="text-label-normal text-title-1 flex items-center gap-2 font-bold">
        마이페이지
      </h1>

      <section className="bg-bg-light shadow-emphasize flex flex-col gap-6 rounded-3xl p-8">
        <div className="flex items-center gap-5">
          <div className="bg-primary-weak text-primary-strong flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold">
            {user.nickname.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-2 text-label-normal font-bold">{user.nickname}</h2>
            <p className="text-label-2 text-label-disable capitalize">{user.kind} 계정</p>
          </div>
        </div>

        <div className="bg-bg-alternative h-px w-full" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-label-2 text-label-disable">닉네임</span>
              <span className="text-body-1 text-label-normal font-medium">{user.nickname}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-label-2 text-label-disable">이메일</span>
              <span className="text-body-1 text-label-normal font-medium">
                {user.email ? user.email : '아직 등록되지 않았어요'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 계정 연동 섹션 */}
      {user.kind === 'guest' && (
        <section className="flex flex-col gap-3">
          <h3 className="text-heading-3 text-label-normal px-2 font-bold">계정 연동</h3>
          <div className="bg-bg-light shadow-emphasize flex flex-col rounded-3xl p-6">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/api/auth/google';
              }}
              className="text-headline-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4285F4] py-3 text-white transition-opacity hover:opacity-90"
            >
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
              Google 계정으로 계속하기
            </button>
            <p className="text-label-2 text-label-disable mt-4 text-xs">
              현재 게스트 계정의 모든 데이터를 Google 계정으로 옮길 수 있어요.
              <br />
              연동 후에는 게스트 로그인이 불가능해요.
            </p>
          </div>
        </section>
      )}

      {/* 설정 섹션 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-heading-3 text-label-normal px-2 font-bold">설정</h3>
        <div className="bg-bg-light shadow-emphasize flex flex-col overflow-hidden rounded-2xl" />
      </section>
    </div>
  );
}
