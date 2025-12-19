import { useEffect } from 'react';
import useDodoChatStore from '@/stores/useDodoChatStore';

export function FirstStampOverlay() {
  const { isFirstStampToday, hideFirstStampOverlay } = useDodoChatStore();

  useEffect(() => {
    if (isFirstStampToday) {
      const timer = setTimeout(() => {
        hideFirstStampOverlay();
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isFirstStampToday, hideFirstStampOverlay]);

  if (!isFirstStampToday) {
    return null;
  }

  const handleInteraction = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'click') {
      hideFirstStampOverlay();
    } else if (event.type === 'keydown') {
      const keyboardEvent = event as React.KeyboardEvent;
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        hideFirstStampOverlay();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      role="button"
      tabIndex={0}
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
      aria-label="첫 시도 축하 오버레이 닫기"
    >
      <div className="animate-bounce-in text-center">
        {/* 이모지 파티 */}
        <div className="mb-6 flex justify-center gap-4 text-6xl">
          <span className="animate-wiggle">🎉</span>
          <span className="animation-delay-100 animate-wiggle">✨</span>
          <span className="animation-delay-200 animate-wiggle">🎊</span>
        </div>

        {/* 메인 메시지 */}
        <h2 className="mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-6xl font-extrabold text-transparent drop-shadow-lg">
          대단해요!!!!!!!!!!!
        </h2>

        {/* 서브 메시지 */}
        <p className="mb-2 text-2xl font-bold text-white drop-shadow-md">첫 시도를 완료했어요!</p>
        <p className="text-lg text-yellow-200">작은 시작이 큰 변화를 만들어요 💪</p>

        {/* 반짝이는 별들 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] animate-twinkle text-4xl">⭐</div>
          <div className="animation-delay-300 absolute right-[15%] top-[25%] animate-twinkle text-3xl">
            ✨
          </div>
          <div className="animation-delay-500 absolute bottom-[30%] left-[20%] animate-twinkle text-3xl">
            🌟
          </div>
          <div className="animation-delay-700 absolute bottom-[35%] right-[10%] animate-twinkle text-4xl">
            💫
          </div>
        </div>
      </div>

      {/* 클릭 힌트 */}
      <p className="absolute bottom-10 animate-pulse text-sm text-white opacity-70">
        화면을 클릭하거나 아무 키나 눌러 계속하기
      </p>
    </div>
  );
}
