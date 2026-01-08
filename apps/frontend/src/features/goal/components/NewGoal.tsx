import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NewGoalStep {
  step: number;
  unskippable?: boolean; // true일 때 skip 버튼 미표시
  headerText: string;
  dialogue: string;
  content: React.ReactNode;
}

export interface NewGoalProps {
  steps: NewGoalStep[];
  progressSteps: number[]; // 진행률 표시에 포함할 스텝
  onSkip: () => void;
  onComplete: () => void;
}

export function NewGoal({ steps, progressSteps, onSkip, onComplete }: NewGoalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const currentProgressIndex = progressSteps.indexOf(currentStep.step);
  const isProgressShown = progressSteps.includes(currentStep.step);

  const handleNext = () => {
    if (isExiting) return;

    if (isLastStep) {
      onComplete?.();
      return;
    }

    setIsExiting(true);
    setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
      setIsExiting(false);
    }, 300);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div className="bg-bg-normal flex h-screen w-full items-center justify-center p-8">
      <div className="bg-bg-light shadow-heavy flex h-full max-h-180 w-full max-w-270 overflow-hidden rounded-[40px]">
        {/* 왼쪽 - 두두 캐릭터 및 대사 영역 */}
        <div className="relative flex w-1/2 flex-col items-center justify-center p-12">
          {/* 말풍선 */}
          {/* TODO: 타이핑 효과 넣기 */}
          <div className="relative mb-12 flex w-full flex-col items-center">
            <div className="bg-bg-alternative relative flex min-h-50 w-full max-w-sm items-center justify-center rounded-4xl shadow-sm">
              <p className="text-heading-2 text-label-normal text-center leading-relaxed font-bold break-keep whitespace-pre-line">
                {currentStep.dialogue}
              </p>
            </div>
            <div className="absolute -bottom-18 left-16 flex flex-col gap-2">
              <div className="bg-bg-alternative -ml-8 h-6 w-6 rounded-full opacity-80" />
              <div className="bg-bg-alternative -ml-5 h-4 w-4 rounded-full opacity-60" />
              <div className="bg-bg-alternative -ml-3 h-2 w-2 rounded-full opacity-50" />
            </div>
          </div>

          {/* 두두 */}
          <div className="mt-auto w-full max-w-75 flex-1">
            <img src="./DodoSit.png" alt="앉은 두두" />
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 w-[1.5px] bg-[#EAEAEA]" />

        {/* 오른쪽 */}
        <div className="flex w-1/2 flex-col">
          <div className="flex items-center justify-between px-12 pt-12">
            <h2 className="text-heading-1 text-label-normal font-bold">{currentStep.headerText}</h2>

            {/* Skip 버튼 */}
            {currentStep.unskippable ? null : (
              <button
                onClick={handleSkip}
                type="button"
                className="text-headline-1 text-primary-weak hover:text-primary-strong font-bold transition-colors"
              >
                skip
              </button>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="relative mt-8 flex-1 overflow-hidden px-12">
            <div
              className={`h-full transition-all duration-300 ease-in-out ${
                isExiting ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              <div className="flex h-full w-full">{currentStep.content}</div>
            </div>
          </div>

          <div className="flex flex-row justify-around">
            <div className="flex items-center justify-end p-12 opacity-0">
              <button
                type="button"
                disabled={isExiting}
                className="group transition-transform active:scale-90 disabled:opacity-50"
                aria-label="Previous Step"
              >
                <ChevronLeft className="text-label-normal h-10 w-10 stroke-[1.5px]" />
              </button>
            </div>

            {/* Progress Indicators */}
            <div
              className={`flex items-center gap-4 ${isProgressShown ? 'opacity-100' : 'opacity-0'}`}
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
            <div className="flex items-center justify-end p-12">
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
    </div>
  );
}
