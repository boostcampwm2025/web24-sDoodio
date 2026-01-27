import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NewGoalFrameStep {
  step: number;
  unskippable?: boolean; // true일 때 skip 버튼 미표시
  headerText: string;
  dialogue: string[]; // string[]로 변경
  content: React.ReactNode;
}

export interface NewGoalFrameProps {
  currStepIdx: number;
  steps: NewGoalFrameStep[];
  progressSteps: number[]; // 진행률 표시에 포함할 스텝
  onMove: (targetIdx: number) => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function NewGoalFrame({
  currStepIdx,
  steps,
  progressSteps,
  onMove,
  onSkip,
  onComplete,
}: NewGoalFrameProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [dialogueFade, setDialogueFade] = useState(true);
  const [resetTimer, setResetTimer] = useState(0);

  const currentStep = steps[currStepIdx];
  const isFirstStep = currStepIdx === 0;
  const isLastStep = currStepIdx === steps.length - 1;

  const currentProgressIndex = progressSteps.indexOf(currentStep.step);
  const isProgressShown = progressSteps.includes(currentStep.step);

  const currentDialogue = currentStep.dialogue[dialogueIdx] || '';
  const isLastDialogue = dialogueIdx >= currentStep.dialogue.length - 1;

  useEffect(() => {
    setDialogueIdx(0);
    setDialogueFade(true);
    setResetTimer((prev) => prev + 1);
  }, [currStepIdx]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const transitionToNextDialogue = () => {
      setDialogueIdx((prev) => prev + 1);
      setDialogueFade(true);
    };

    const startTransition = () => {
      setDialogueFade(false);
      setTimeout(transitionToNextDialogue, 300);
    };

    if (!isLastDialogue) {
      timer = setTimeout(startTransition, 3000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [dialogueIdx, isLastDialogue, resetTimer]);

  const animationStyles = {
    next: '-translate-x-full opacity-0',
    prev: 'translate-x-full opacity-0',
  } as const;

  const currentAnimation = isExiting ? animationStyles[direction] : 'translate-x-0 opacity-100';

  const handleNext = () => {
    if (isExiting) return;

    // 마지막 스텝이면 완료
    if (isLastStep) {
      onComplete?.();
      return;
    }

    // 다음 스텝으로
    setDirection('next');
    setIsExiting(true);
    setTimeout(() => {
      onMove(currStepIdx + 1);
      setIsExiting(false);
    }, 300);
  };

  const handlePrev = () => {
    if (isExiting || isFirstStep) return;

    // 이전 스텝으로
    setDirection('prev');
    setIsExiting(true);
    setTimeout(() => {
      onMove(currStepIdx - 1);
      setIsExiting(false);
    }, 300);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div className="bg-bg-normal flex h-full w-full items-center justify-center p-4 md:p-8 lg:p-12">
      <div className="bg-bg-light shadow-heavy flex h-[700px] w-full max-w-sm flex-shrink-0 flex-col overflow-hidden rounded-3xl md:h-[800px] md:max-w-3xl md:rounded-4xl lg:h-[850px] lg:max-w-[1240px] lg:flex-row">
        {/* 왼쪽 - 두두 캐릭터 및 대사 영역 */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center p-6 pb-0 md:p-8 md:pb-0 lg:p-12 lg:pb-12">
          {/* 말풍선 */}
          {/* TODO: 타이핑 효과 넣기 */}
          <div className="relative mb-2 flex w-full flex-col items-center md:mb-6 lg:mb-12">
            <div className="bg-bg-alternative relative flex min-h-16 w-full max-w-xs items-center justify-center rounded-3xl px-6 shadow-sm md:min-h-28 md:max-w-sm md:rounded-4xl lg:min-h-50">
              <p
                className={`text-label-normal text-body-1 md:text-headline-1 lg:text-heading-2 text-center leading-relaxed font-bold break-keep whitespace-pre-line transition-opacity duration-300 ${
                  dialogueFade ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {currentDialogue}
              </p>
            </div>
            <div className="absolute -bottom-10 left-10 flex flex-col gap-1 md:-bottom-18 md:left-16 md:gap-2">
              <div className="bg-bg-alternative -ml-4 h-3 w-3 rounded-full opacity-80 md:-ml-8 md:h-6 md:w-6" />
              <div className="bg-bg-alternative -ml-3 h-2 w-2 rounded-full opacity-60 md:-ml-5 md:h-4 md:w-4" />
              <div className="bg-bg-alternative -ml-2 h-1.5 w-1.5 rounded-full opacity-50 md:h-2 md:w-2" />
            </div>
          </div>

          {/* 두두 */}
          <div className="mt-auto flex w-full items-center justify-center lg:block">
            <div className="w-full max-w-24 md:max-w-40 lg:max-w-75">
              <img
                src="/DodoSitdown.png"
                alt="앉은 두두"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-[1.5px] w-full shrink-0 bg-[#EAEAEA] lg:my-12 lg:h-auto lg:w-[1.5px]" />

        {/* 오른쪽 */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-6 pt-0 md:p-8 md:pt-0 lg:p-12">
          <div className="flex shrink-0 items-center justify-between">
            <h2 className="text-label-normal text-headline-1 md:text-heading-1 font-bold">
              {currentStep.headerText}
            </h2>

            {/* Skip 버튼 */}
            {currentStep.unskippable ? null : (
              <button
                onClick={handleSkip}
                type="button"
                className="text-label-1 text-primary-weak hover:text-primary-strong md:text-headline-1 transition-colors md:font-bold"
              >
                skip
              </button>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="relative mt-4 flex-1 overflow-x-hidden overflow-y-auto md:mt-8">
            <div className={`transition-all duration-300 ease-in-out ${currentAnimation}`}>
              <div className="flex min-h-full w-full py-4 lg:py-0">{currentStep.content}</div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between pt-4 md:pt-6 lg:pt-8">
            {/* 이전 버튼 */}
            <button
              onClick={handlePrev}
              type="button"
              disabled={isExiting || isFirstStep}
              className={`group transition-all active:scale-90 ${
                isFirstStep ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
              aria-label="Previous Step"
            >
              <ChevronLeft className="text-label-normal h-10 w-10 stroke-[1.5px]" />
            </button>

            {/* Progress Indicators */}
            <div
              className={`flex items-center gap-4 transition-opacity ${
                isProgressShown ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {progressSteps.map((stepNum, index) => (
                <div key={stepNum} className="relative flex items-center justify-center">
                  {index === currentProgressIndex && (
                    <div className="bg-secondary-normal absolute h-6 w-6 animate-pulse rounded-full opacity-30" />
                  )}
                  <div
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      index <= currentProgressIndex ? 'bg-secondary-normal' : 'bg-[#E5E5E5]'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNext}
              type="button"
              disabled={isExiting}
              className="group transition-transform active:scale-90 disabled:opacity-50"
              aria-label="Next Step"
            >
              <ChevronRight className="text-label-normal h-10 w-10 stroke-[1.5px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
