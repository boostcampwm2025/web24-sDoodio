import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NewGoalFrameStep {
  step: number;
  unskippable?: boolean; // true일 때 skip 버튼 미표시
  headerText: string;
  dialogue: string[]; // string[]로 변경
  content: React.ReactNode;
  validate?: () => boolean;
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
  const [isDialogueVisible, setIsDialogueVisible] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const changeDialogueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[currStepIdx];
  const isFirstStep = currStepIdx === 0;
  const isLastStep = currStepIdx === steps.length - 1;

  const currentProgressIndex = progressSteps.indexOf(currentStep.step);
  const isProgressShown = progressSteps.includes(currentStep.step);

  const hasMultipleDialogues = currentStep.dialogue.length > 1;
  const isFirstDialogue = dialogueIdx <= 0;
  const isLastDialogue = dialogueIdx >= currentStep.dialogue.length - 1;

  useEffect(() => {
    setDialogueIdx(0);
    setIsDialogueVisible(true);
    setIsAutoMode(true);
  }, [currStepIdx]);

  // 대사 변경 함수
  const changeDialogue = (targetIdx: number, isAutoTrigger = false) => {
    if (!isAutoTrigger) {
      setIsAutoMode(false);
    }

    setIsDialogueVisible(false);
    if (changeDialogueTimerRef.current) {
      clearTimeout(changeDialogueTimerRef.current);
    }

    changeDialogueTimerRef.current = setTimeout(() => {
      setDialogueIdx(targetIdx);
      setIsDialogueVisible(true);
    }, 300);
  };

  // 자동 대사 전환 로직
  useEffect(() => {
    let autoTimer: ReturnType<typeof setTimeout> | undefined;

    if (isAutoMode && !isLastDialogue) {
      autoTimer = setTimeout(() => {
        changeDialogue(dialogueIdx + 1, true);
      }, 3000);
    }

    return () => {
      if (autoTimer) {
        clearTimeout(autoTimer);
      }
    };
  }, [dialogueIdx, isAutoMode, isLastDialogue]);

  useEffect(
    () => () => {
      if (changeDialogueTimerRef.current) {
        clearTimeout(changeDialogueTimerRef.current);
      }
    },
    [],
  );

  const animationStyles = {
    next: '-translate-x-full opacity-0',
    prev: 'translate-x-full opacity-0',
  } as const;

  const currentAnimation = isExiting ? animationStyles[direction] : 'translate-x-0 opacity-100';

  const handleNext = () => {
    if (isExiting) return;

    // 마지막 스텝이면 완료
    if (isLastStep) {
      if (currentStep.validate && !currentStep.validate()) return;
      onComplete?.();
      return;
    }

    // 검증 로직 수행
    if (currentStep.validate && !currentStep.validate()) return;

    // 다음 스텝으로
    setDirection('next');
    setIsExiting(true);
    setIsDialogueVisible(false);
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
    setIsDialogueVisible(false);
    setTimeout(() => {
      onMove(currStepIdx - 1);
      setIsExiting(false);
    }, 300);
  };

  const handleSkip = () => {
    if (currentStep.validate && !currentStep.validate()) return;
    onSkip?.();
  };

  const handlePrevDialogue = () => {
    if (isFirstDialogue) return;
    changeDialogue(dialogueIdx - 1);
  };

  const handleNextDialogue = () => {
    if (isLastDialogue) return;
    changeDialogue(dialogueIdx + 1);
  };

  return (
    <div className="bg-bg-normal flex h-full w-full items-center justify-center px-0 py-2 font-sans lg:p-4">
      <div className="bg-bg-light lg:shadow-heavy relative flex h-full w-full flex-col overflow-hidden rounded-3xl lg:h-180 lg:max-w-250 lg:flex-row lg:rounded-4xl">
        {/* 왼쪽 - 두두 캐릭터 및 대사 영역 */}
        <div className="relative flex flex-none flex-row items-end gap-6 p-4 pb-0 md:p-6 md:pb-0 lg:flex-1 lg:flex-col-reverse lg:justify-center lg:p-12 lg:pb-12">
          {/* 두두 */}
          <div className="flex flex-none items-end justify-center lg:mt-auto lg:mb-10 lg:w-full lg:justify-start">
            <div className="w-full max-w-16 md:max-w-24 lg:max-w-50">
              <img
                src="/DodoSitdown.webp"
                alt="앉은 두두"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* 말풍선 컨테이너 (너비 고정 및 꼬리 정렬용) */}
          <div className="relative flex min-w-0 flex-1 flex-col items-center lg:mb-20 lg:w-full lg:max-w-md">
            <div
              className={`bg-bg-alternative relative flex min-h-20 w-full items-center justify-center rounded-3xl p-4 shadow-sm md:min-h-32 md:rounded-4xl md:p-6 lg:min-h-50 lg:px-10 lg:py-8 ${
                hasMultipleDialogues ? 'pr-12 pb-8 md:pr-14' : ''
              }`}
            >
              <p
                className={`text-label-normal md:text-headline-1 lg:text-heading-2 text-center text-sm leading-relaxed font-bold break-keep whitespace-pre-line transition-opacity duration-300 md:text-base ${
                  isDialogueVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {currentStep.dialogue[dialogueIdx] || ''}
              </p>
              {hasMultipleDialogues && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 md:right-4 md:bottom-4">
                  {/* 이전 대사 전환 버튼 */}
                  <button
                    type="button"
                    onClick={handlePrevDialogue}
                    disabled={isFirstDialogue}
                    className="disabled:opacity-40"
                    aria-label="Previous Dialogue"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {/* 다음 대사 전환 버튼 */}
                  <button
                    type="button"
                    onClick={handleNextDialogue}
                    disabled={isLastDialogue}
                    className="disabled:opacity-40"
                    aria-label="Next Dialogue"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            {/* 말풍선 꼬리 (말풍선 왼쪽 정렬) */}
            <div className="absolute top-1/2 -left-4 flex -translate-y-1/2 flex-row-reverse gap-1 lg:top-auto lg:-bottom-10 lg:left-6 lg:translate-y-0 lg:flex-col lg:gap-2">
              <div className="bg-bg-alternative h-2 w-2 rounded-full opacity-80 md:h-4 md:w-4 lg:h-6 lg:w-6" />
              <div className="bg-bg-alternative h-1.5 w-1.5 rounded-full opacity-60 md:h-3 md:w-3 lg:h-4 lg:w-4" />
              <div className="bg-bg-alternative h-1 w-1 rounded-full opacity-50 md:h-2 md:w-2" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="bg-bg-alternative m-4 h-[1.5px] shrink-0 lg:my-12 lg:h-auto lg:w-[1.5px]" />

        {/* 오른쪽 */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-6 pt-0 lg:p-12">
          <div
            className={`flex shrink-0 items-center justify-between ${currentStep.headerText === '' ? '' : 'py-2'}`}
          >
            <h2 className="text-label-normal text-headline-1 md:text-heading-1 font-bold">
              {currentStep.headerText}
            </h2>

            {/* Skip 버튼 */}
            {currentStep.unskippable ? null : (
              <button
                onClick={handleSkip}
                type="button"
                className="text-label-1 text-primary-weak hover:text-primary-strong md:text-headline-1 font-bold transition-colors"
              >
                skip
              </button>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="scrollbar-pretty relative -mx-2 flex-1 overflow-x-hidden overflow-y-auto p-2">
            <div className={`transition-all duration-300 ease-in-out ${currentAnimation}`}>
              <div className="flex min-h-full w-full lg:py-0">{currentStep.content}</div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between pt-2 md:pt-3 lg:pt-4">
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
              <ChevronLeft className="text-label-normal size-6 stroke-[1.5px] md:size-8 lg:size-10" />
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
              <ChevronRight className="text-label-normal size-6 stroke-[1.5px] md:size-8 lg:size-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
