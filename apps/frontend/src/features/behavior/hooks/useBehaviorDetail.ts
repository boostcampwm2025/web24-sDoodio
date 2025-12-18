import { useState } from 'react';
import type { BehaviorDetail } from '../types/behavior.types';

export const useBehaviorDetail = () => {
  const [behavior, setBehavior] = useState<BehaviorDetail>({
    id: '1',
    title: '물 마시기',
    description:
      '미지근한 물을 한 잔 마시면 신진대사가 활발해지고 정신이 맑아집니다. 작은 실천으로 건강한 아침을 시작해보세요!',
    category: {
      id: 'health',
      label: '건강',
      color: 'bg-emerald-500',
    },
    period: '매일',
    isMandatory: true,
    totalStamps: 3,
    goalStamps: 10,
    isAddedToToday: true,
    isStampedToday: false,
  });

  const progress = Math.min(100, Math.round((behavior.totalStamps / behavior.goalStamps) * 100));

  const toggleAdd = () => {
    setBehavior((prev: BehaviorDetail) => ({
      ...prev,
      isAddedToToday: !prev.isAddedToToday,
    }));
  };

  const stamp = () => {
    setBehavior((prev: BehaviorDetail) => ({
      ...prev,
      isStampedToday: true,
      totalStamps: prev.totalStamps + 1,
    }));
  };

  return {
    behavior,
    progress,
    toggleAdd,
    stamp,
  };
};
