import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';

type TabItem =
  | string
  | {
      label: string;
      value: string;
    };

interface SwiperTabsProps {
  tabs: TabItem[];
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
      {tabs.map((tab, idx) => {
        const label = typeof tab === 'string' ? tab : tab.label;
        const value = typeof tab === 'string' ? tab : tab.value;

        return (
          <SwiperSlide key={label} className="w-auto!">
            <button
              type="button"
              onClick={() => {
                setActive(idx);
                onChange(value);
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
        );
      })}
    </Swiper>
  );
}
