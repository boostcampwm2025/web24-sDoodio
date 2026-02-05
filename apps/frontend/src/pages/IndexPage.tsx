import { useState, useEffect, useRef } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { REWARD_LINES } from '@/features/goal/constants/dodo';
import { AIBehaviorContainer } from '@/features/behavior/components/AIBehaviorContainer';
import { TodayBehaviorList } from '@/features/behavior/components/TodayBehaviorList';
import { useAIBehaviors } from '@/features/behavior/hooks/useAIBehaviors';
import { updateAIBehaviorStatus } from '@/features/behavior/apis/updateAIBehaviorStatus.api';
import { toast } from 'react-toastify';
import { getRandomElement } from '@/shared/utils/random';
import useAuthStore from '@/stores/useAuthStore';
import { useAutoWebPushSubscribe } from '@/features/push/hooks/useAutoWebPushSubscribe';
import { useToggleTodayBehaviorMutation } from '@/features/behavior/hooks/useToggleTodayBehaviorMutation';
import { useDeleteTodayBehaviorMutation } from '@/features/behavior/hooks/useDeleteTodayBehaviorMutation';
import { useRefreshTodayBehaviorsMutation } from '@/features/behavior/hooks/useRefreshTodayBehaviorsMutation';
import { useGoalsQuery } from '@/features/goal/hooks/useGoalsQuery';
import { useTodayBehaviorsQuery } from '@/features/behavior/hooks/useTodayBehaviorsQuery';
import { useTodayBehaviorsDisplay } from '@/features/behavior/hooks/useTodayBehaviorsDisplay';

export function IndexPage() {
  const { user } = useAuthStore();
  const { data: behaviors = [] } = useTodayBehaviorsQuery(user?.id);
  const { data: goals = [] } = useGoalsQuery();

  const toggleMutation = useToggleTodayBehaviorMutation();
  const deleteMutation = useDeleteTodayBehaviorMutation();
  const refreshMutation = useRefreshTodayBehaviorsMutation();

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

  useAutoWebPushSubscribe({ enabled: !!user, mode: 'silent' });

  const headerHeightValue = getComputedStyle(document.documentElement)
    .getPropertyValue('--header-h')
    .trim();
  const headerHeight = Number.parseFloat(headerHeightValue) || 0;

  // Hero 섹션 보이는지 확인
  useEffect(() => {
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
  }, [headerHeight]);

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

  const { displayBehaviors, handleBehaviorToggle } = useTodayBehaviorsDisplay({
    behaviors,
    toggleMutation,
    handleRewardInteraction,
  });

  const toggleAIBehaviorIsChecked = (behaviorId: string) => {
    setAIBehaviors((bs) =>
      bs.map((b) => (b.id === behaviorId ? { ...b, isChecked: !b.isChecked } : b)),
    );
  };

  const handleBehaviorDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onError: () => toast('삭제에 실패했습니다.'),
    });
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
    refreshMutation.mutate(undefined, {
      onError: () => toast('새로고침에 실패했습니다.'),
    });
  };

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
        behaviors={displayBehaviors}
        onToggle={handleBehaviorToggle}
        onRefresh={handleRefreshTodayBehaviors}
        onDelete={handleBehaviorDelete}
      />
    </div>
  );
}
