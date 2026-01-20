import { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';

export type ToastPosition = 'top' | 'bottom' | 'left' | 'right';

interface DodoToastProps {
  message: string;
  duration?: number;
  position?: ToastPosition;
  onClose?: () => void;
}

interface DodoCharacterProps {
  variants: Variants;
}

function DodoCharacter({ variants }: DodoCharacterProps) {
  return (
    <motion.div
      className="flex h-20 w-20 shrink-0 items-center justify-center"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
    >
      <img src="/dodo.png" alt="두두" className="h-full w-full object-contain" />
    </motion.div>
  );
}

interface SpeechBubbleProps {
  message: string;
  tailClasses: string;
}

const bubbleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

function SpeechBubble({ message, tailClasses }: SpeechBubbleProps) {
  return (
    <motion.div
      className="bg-bg-light shadow-emphasize relative w-full rounded-2xl px-6 py-4"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        delay: 0.15, // 캐릭터 다음에 등장
        duration: 0.3,
        ease: 'easeOut',
      }}
    >
      {/* 말풍선 꼬리 */}
      <div className={`absolute h-0 w-0 ${tailClasses}`} />

      {/* 메시지 */}
      <p className="text-label-normal text-center leading-relaxed font-medium break-keep whitespace-pre-wrap">
        {message}
      </p>
    </motion.div>
  );
}

function DodoToast({ message, duration = 3000, position = 'bottom', onClose }: DodoToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, message]);

  const getContainerClasses = () => {
    const base = 'fixed z-50 pointer-events-none';
    const safeArea = {
      top: 'top-20 md:top-28 left-1/2 -translate-x-1/2',
      bottom: 'bottom-20 md:bottom-4 left-1/2 -translate-x-1/2',
      left: 'left-4 top-1/2 -translate-y-1/2',
      right: 'right-4 top-1/2 -translate-y-1/2',
    };

    return `${base} ${safeArea[position]}`;
  };

  const getCharacterVariants = (): Variants => {
    const animDist = 300;

    switch (position) {
      case 'top':
        return {
          hidden: { y: -animDist, opacity: 0 },
          visible: { y: 0, opacity: 1 },
          exit: { y: -animDist, opacity: 0 },
        };
      case 'left':
        return {
          hidden: { x: -animDist, opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: -animDist, opacity: 0 },
        };
      case 'right':
        return {
          hidden: { x: animDist, opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: animDist, opacity: 0 },
        };
      case 'bottom':
      default:
        return {
          hidden: { y: animDist, opacity: 0 },
          visible: { y: 0, opacity: 1 },
          exit: { y: animDist, opacity: 0 },
        };
    }
  };

  // 말풍선 꼬리 방향
  const getTailClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-[12px] border-x-[10px] border-x-transparent border-b-bg-light';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 border-t-[12px] border-x-[10px] border-x-transparent border-t-bg-light';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 border-r-[12px] border-y-[10px] border-y-transparent border-r-bg-light';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 border-l-[12px] border-y-[10px] border-y-transparent border-l-bg-light';
      default:
        return '';
    }
  };

  const characterVariants = getCharacterVariants();
  const tailClasses = getTailClasses();

  const layoutClasses = {
    top: 'flex-col gap-3',
    bottom: 'flex-col-reverse gap-3',
    left: 'flex-row gap-4',
    right: 'flex-row-reverse gap-4',
  };

  return (
    <motion.div
      className={getContainerClasses()}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }}
    >
      <div className={`flex items-center ${layoutClasses[position]}`}>
        <DodoCharacter variants={characterVariants} />
        <SpeechBubble message={message} tailClasses={tailClasses} />
      </div>
    </motion.div>
  );
}

export default DodoToast;
