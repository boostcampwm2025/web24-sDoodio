import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

const SLIDES = [
  {
    id: 'dodo',
    title: '안녕! 나는 두두야',
    description: '뚜웰에서는 오늘 한 행동을 차곡차곡 쌓아갈 수 있어',
    image: '/DodoStand.webp',
  },
  {
    id: 'goal',
    title: '목표와 행동',
    description: '이루고 싶은 목표를 정해봐\n그 목표를 작은 행동으로 나눠서 해보자',
    image: '/OnBoardingGoalAndBehavior.webp',
  },
  {
    id: 'today',
    title: '오늘의 행동',
    description: '여러 목표 중에서\n오늘 하면 좋을 행동을 골라줄게\n\n이제 천천히 같이 해보자!',
    image: '/OnBoardingTodayBehavior.webp',
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === SLIDES.length - 1;

  const navigateToIndex = () => {
    navigate('/');
  };

  const handleNext = () => {
    if (isLast) {
      navigateToIndex();
      return;
    }
    swiperRef.current?.slideNext();
  };

  return (
    <div className="bg-bg-normal flex min-h-screen flex-col items-center justify-between px-6 pt-8 pb-10">
      <div className="w-full max-w-3xl flex-1">
        <Swiper
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="bg-bg-alternative h-full rounded-3xl"
        >
          {SLIDES.map((slide) => (
            <SwiperSlide key={slide.id} className="flex h-full flex-col items-center">
              <div className="flex h-[80vh] w-full flex-1 flex-col items-center justify-around px-6 py-8">
                <p className="text-label-normal text-title-2 mb-4 text-center font-bold">
                  {slide.title}
                </p>
                <div>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-[40vh] w-full object-contain"
                  />
                  <p className="text-label-normal text-headline-1 mt-5 text-center leading-relaxed font-semibold whitespace-pre-line">
                    {slide.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="mt-8 flex w-full max-w-3xl items-center justify-between">
        <button
          type="button"
          onClick={navigateToIndex}
          disabled={isLast}
          aria-hidden={isLast}
          aria-label={isLast ? '' : '바로 시작하기'}
          className="bg-bg-alternative text-label-normal hover:bg-bg-alternative/80 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors disabled:invisible"
        >
          바로 시작하기
        </button>

        <div className="flex items-center gap-2">
          {SLIDES.map((slide, idx) => (
            <span
              key={slide.id}
              className={`h-3 w-3 rounded-full ${
                idx === activeIndex ? 'bg-primary-strong' : 'bg-bg-alternative'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label={isLast ? '바로 시작하기' : '다음'}
          className="bg-primary-strong text-bg-light hover:bg-primary-strong/90 disabled:bg-primary-weak rounded-2xl px-6 py-3 text-sm font-semibold transition-colors"
        >
          {isLast ? '바로 시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}
