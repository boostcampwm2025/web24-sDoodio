import { useState, useEffect, useRef } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { REWARD_LINES } from '@/features/goal/constants/dodo';
import { AIBehaviorContainer } from '@/features/behavior/components/AIBehaviorContainer';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { TodayBehaviorList } from '@/features/behavior/components/TodayBehaviorList';
import { fetchTodayBehaviors } from '@/features/behavior/apis/fetchBehaviors.api';
import { fetchGoals } from '@/features/goal/apis/fetchGoals.api';
import { updateTodayBehaviorStatus } from '@/features/behavior/apis/updateTodayBehaviorStatus.api';
import { useAIBehaviors } from '@/features/behavior/hooks/useAIBehaviors';
import { updateAIBehaviorStatus } from '@/features/behavior/apis/updateAIBehaviorStatus.api';
import { refreshTodayBehaviors } from '@/features/behavior/apis/refreshTodayBehaviors.api';
import { deleteTodayBehavior } from '@/features/behavior/apis/deleteTodayBehavior.api';
import { toast } from 'react-toastify';
import { createTodayBehavior } from '@/features/behavior/apis/createTodayBehavior.api';
import type { GetGoalSummary } from '@web24/shared';
import { getRandomElement } from '@/shared/utils/random';
import useAuthStore from '@/stores/useAuthStore';
import { useAutoWebPushSubscribe } from '@/features/push/hooks/useAutoWebPushSubscribe';
import { useScroll } from '@/shared/hooks/useScroll';

export function IndexPage() {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [goals, setGoals] = useState<GetGoalSummary[]>([]);
  const { quote, resetQuote } = useDodoChatStore();
  const {
    behaviors: aiBehaviors,
    setBehaviors: setAIBehaviors,
    isLoading,
    isMaking,
  } = useAIBehaviors();
  const showToast = useDodoToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const isScrolled = useScroll(10);
  const [isDesktop, setIsDesktop] = useState(false);

  const { user } = useAuthStore();
  useAutoWebPushSubscribe({ enabled: !!user, mode: 'silent' });

  useEffect(() => {
    const media = globalThis.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Hero 섹션 보이는지 확인
  useEffect(() => {
    const headerHeightValue = getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')
      .trim();
    const headerHeight = Number.parseFloat(headerHeightValue) || 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [isDesktop, isScrolled]);

  const handleRewardInteraction = (templateId?: string) => {
    const lines = (templateId && REWARD_LINES[templateId]) || REWARD_LINES.default;
    let rewardQuote = getRandomElement(lines) || '';
    if (lines.length > 1 && rewardQuote === quote) {
      let nextQuote = rewardQuote;
      let attempts = 0;
      while (nextQuote === quote && attempts < 5) {
        nextQuote = getRandomElement(lines) || '';
        attempts += 1;
      }
      rewardQuote = nextQuote;
    }

    useDodoChatStore.getState().setQuote(rewardQuote);
    if (!isHeroVisible) {
      showToast(rewardQuote, { position: 'top' });
    }
  };

  const toggleBehaviorIsChecked = (behaviorId: string) => {
    setBehaviors((bs) =>
      bs.map((b) => (b.id === behaviorId ? { ...b, isChecked: !b.isChecked } : b)),
    );
  };

  const toggleAIBehaviorIsChecked = (behaviorId: string) => {
    setAIBehaviors((bs) =>
      bs.map((b) => (b.id === behaviorId ? { ...b, isChecked: !b.isChecked } : b)),
    );
  };

  const handleBehaviorToggle = (id: string) => {
    const targetBehavior = behaviors.find((bs) => bs.id === id);
    if (!targetBehavior) return;

    toggleBehaviorIsChecked(id);

    const nextStatus = targetBehavior.isChecked ? 'pending' : 'completed';
    updateTodayBehaviorStatus(id, nextStatus)
      .then(() => {
        if (nextStatus === 'completed') {
          handleRewardInteraction(targetBehavior.goalTemplateId);
        }
      })
      .catch(() => toggleBehaviorIsChecked(id));
  };

  const removeBehavior = (behaviorId: string) => {
    setBehaviors((bs) => bs.filter((b) => b.id !== behaviorId));
  };

  const handleBehaviorDelete = async (id: string) => {
    try {
      await deleteTodayBehavior(id);
      removeBehavior(id);
    } catch {
      toast('삭제에 실패했습니다.');
    }
  };

  const handleAIBehaviorToggle = (id: string) => {
    const targetBehavior = aiBehaviors.find((bs) => bs.id === id);
    if (!targetBehavior) return;

    toggleAIBehaviorIsChecked(id);

    const nextStatus = targetBehavior.isChecked ? 'pending' : 'completed';
    updateAIBehaviorStatus(id, nextStatus)
      .then(() => {
        if (nextStatus === 'completed') {
          handleRewardInteraction(targetBehavior.goalTemplateId);
        }
      })
      .catch(() => toggleAIBehaviorIsChecked(id));
  };

  const handleRefreshTodayBehaviors = () => {
    refreshTodayBehaviors()
      .then((refreshedBehaviors) => setBehaviors(refreshedBehaviors))
      .catch(() => {
        toast('새로고침에 실패했습니다.');
      });
  };

  const handleBehaviorAdd = async (behaviorId: string) => {
    const nextBehaviors = await createTodayBehavior(behaviorId);
    setBehaviors(nextBehaviors);
  };

  useEffect(() => {
    Promise.all([fetchTodayBehaviors(), fetchGoals()]).then(([behaviorsData, goalsData]) => {
      setBehaviors(behaviorsData);
      setGoals(goalsData);
    });
  }, []);

  useEffect(
    () => () => {
      resetQuote();
    },
    [resetQuote],
  );

  return (
    <div className="bg-bg-normal mx-auto flex max-w-5xl flex-col pt-2">
      {/* 두두의 말 */}
      <div ref={heroRef} className="mb-10">
        <Hero quote={quote} />
      </div>

      {/* AI 추천 행동 */}
      <AIBehaviorContainer
        behaviors={aiBehaviors}
        isLoading={isLoading}
        isMaking={isMaking}
        onToggle={handleAIBehaviorToggle}
      />

      {/* 오늘의 행동 */}
      <TodayBehaviorList
        goals={goals}
        behaviors={behaviors}
        onToggle={handleBehaviorToggle}
        onAddBehavior={handleBehaviorAdd}
        onRefresh={handleRefreshTodayBehaviors}
        onDelete={handleBehaviorDelete}
      />
    </div>
  );
}
