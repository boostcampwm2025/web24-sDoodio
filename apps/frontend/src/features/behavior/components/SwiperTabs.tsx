import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';

interface SwiperTabsProps {
  tabs: string[];
  onChange: (id: string) => void;
  slideOffsetAfter?: number;
}

export function SwiperTabs({ tabs, onChange, slideOffsetAfter }: SwiperTabsProps) {
  const [active, setActive] = useState(0);

  return (
    <Swiper
      slidesPerView="auto"
      spaceBetween={24}
      className="relative pb-2"
      slidesOffsetAfter={slideOffsetAfter}
    >
      {tabs.map((label, idx) => (
        <SwiperSlide key={label} className="w-auto!">
          <button
            type="button"
            onClick={() => {
              setActive(idx);
              onChange(label);
            }}
            className={`relative pb-2 text-sm font-semibold ${
              active === idx ? 'text-label-normal' : 'text-label-disable'
            }`}
          >
            {label}

            <span
              className={`bg-primary-strong absolute bottom-0 left-0 h-0.5 w-full transition-transform duration-300 ${active === idx ? 'scale-x-100' : 'scale-x-0'} `}
              style={{ transformOrigin: 'center' }}
            />
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
