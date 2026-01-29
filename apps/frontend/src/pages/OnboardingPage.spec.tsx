import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React, { useEffect, useRef, useState } from 'react';
import { OnboardingPage } from './OnboardingPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('swiper/css', () => ({}));

vi.mock('swiper/react', () => {
  function Swiper({ children, onSwiper, onSlideChange }: any) {
    const slides = React.Children.toArray(children);
    const [index, setIndex] = useState(0);
    const indexRef = useRef(0);

    const slideNext = () => {
      const next = Math.min(indexRef.current + 1, slides.length - 1);
      indexRef.current = next;
      setIndex(next);
      onSlideChange?.({ activeIndex: next });
    };

    useEffect(() => {
      onSwiper?.({ slideNext });
    }, [onSwiper]);

    return <div data-testid="swiper">{slides[index]}</div>;
  }

  function SwiperSlide({ children }: any) {
    return <div>{children}</div>;
  }

  return { Swiper, SwiperSlide };
});

describe('OnboardingPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('첫 번째 슬라이드를 렌더링한다', () => {
    render(<OnboardingPage />);

    expect(screen.getByText('안녕! 나는 두두야')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
  });

  it('다음 버튼을 누르면 다음 슬라이드로 이동한다', () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByText('목표와 행동')).toBeInTheDocument();
  });

  it('마지막 슬라이드에서는 바로 시작하기가 표시된다', () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByRole('button', { name: '바로 시작하기' })).toBeInTheDocument();
  });

  it('바로 시작하기를 누르면 메인페이지로 이동한다', () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: '바로 시작하기' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
