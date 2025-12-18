import { useRef } from 'react';
import { Droplets, Star } from 'lucide-react';
import type { WaterBottleProps, WaveLayerProps, BubbleProps } from '../types/waterBottle.types';
import { useStarParticles } from '../hooks/useStarParticles';
import { applyClickForce } from '../hooks/useBottleCilck';

// 기포 컴포넌트
function Bubble({ left, duration, delay }: BubbleProps) {
  return (
    <div
      className="absolute bottom-[-20px] h-3 w-3 rounded-full bg-white/30"
      style={{ left, animation: `bubble-rise ${duration} ease-in infinite`, animationDelay: delay }}
    />
  );
}

// 단일 웨이브 SVG 컴포넌트
function SingleWaveSVG() {
  return (
    <svg
      className="block h-full w-full"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,100 L0,50 Q250,0 500,50 Q750,100 1000,50 L1000,100 Z" fill="currentColor" />
    </svg>
  );
}

// 웨이브 레이어 컴포넌트
function WaveLayer({ color, opacity, duration, delay = '0s', zIndex }: WaveLayerProps) {
  return (
    <div
      className={`absolute bottom-0 flex h-full w-[200%] flex-nowrap ${color} ${opacity}`}
      style={{
        animation: 'wave-slide linear infinite',
        animationDuration: duration,
        animationDelay: delay,
        zIndex,
      }}
    >
      <div className="h-full w-1/2 min-w-[50%]">
        <SingleWaveSVG />
      </div>
      <div className="-ml-[1px] h-full w-1/2 min-w-[50%]">
        <SingleWaveSVG />
      </div>
    </div>
  );
}

export default function WaterBottle({ progress, badgeCount }: WaterBottleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { stars, setStars } = useStarParticles(badgeCount);

  // 클릭 시 힘 적용
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const waterHeightPx = rect.height * (progress / 100);
    const clickYFromBottomPx = rect.bottom - e.clientY;
    const clickY = (clickYFromBottomPx / waterHeightPx) * 100;

    setStars((prev) => applyClickForce(prev, clickX, clickY, progress));
  };

  return (
    <div
      ref={containerRef}
      role="presentation"
      onClick={handleContainerClick}
      className="relative isolate mx-auto h-[500px] max-w-[22rem] cursor-pointer select-none overflow-hidden rounded-[4rem] border-[8px] border-white bg-white shadow-[0_20px_60px_-15px_rgba(59,130,246,0.4)] ring-1 ring-gray-100"
      style={{
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05), 0 20px 60px -15px rgba(59,130,246,0.4)',
      }}
    >
      {/* 유리 하이라이트 */}
      <div className="pointer-events-none absolute left-5 right-5 top-4 z-50 h-[92%] rounded-[3.5rem] bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70" />
      <div className="pointer-events-none absolute left-8 top-12 z-50 h-24 w-3 rounded-full bg-white/40 blur-[2px]" />

      {/* 배경 그리드 */}
      <div
        className="absolute inset-0 bg-slate-50/50"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-indigo-900/10">
        <Droplets size={80} className="mb-4" />
      </div>

      {/* 물 컨테이너 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ height: `${progress}%` }}
      >
        {/* 웨이브 상단 */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-[60px] w-full translate-y-[-99%] overflow-hidden">
          <WaveLayer color="text-blue-300" opacity="opacity-40" duration="10s" zIndex={10} />
          <WaveLayer
            color="text-blue-400"
            opacity="opacity-60"
            duration="7s"
            delay="-2s"
            zIndex={20}
          />
          <WaveLayer
            color="text-blue-500"
            opacity="opacity-100"
            duration="5s"
            delay="-1s"
            zIndex={30}
          />
        </div>

        {/* 물 본체 */}
        <div className="relative h-full w-full bg-gradient-to-b from-blue-500 to-indigo-600">
          {/* 별 파티클 */}
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute z-20 flex items-center justify-center will-change-transform"
              style={{
                left: `${star.x}%`,
                bottom: `${star.y}%`,
                width: `${star.size}rem`,
                height: `${star.size}rem`,
                transform: `rotate(${star.rotation}deg)`,
              }}
            >
              <Star
                size={24}
                fill="yellow"
                stroke="none"
                className="absolute inset-0 animate-pulse opacity-70"
              />
            </div>
          ))}

          {/* 물속 기포 */}
          <Bubble left="15%" duration="4s" delay="0s" />
          <Bubble left="45%" duration="6s" delay="2s" />
          <Bubble left="75%" duration="5s" delay="1s" />
        </div>
      </div>
    </div>
  );
}
