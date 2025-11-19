import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface QuestionTransitionProps {
  children: ReactNode;
  questionId: string;
  direction: 'forward' | 'backward';
  isTransitioning: boolean;
}

export const QuestionTransition = ({
  children,
  questionId,
  direction,
  isTransitioning,
}: QuestionTransitionProps) => {
  const [animationState, setAnimationState] = useState<'entering' | 'idle' | 'exiting'>('idle');

  useEffect(() => {
    if (isTransitioning) {
      setAnimationState('exiting');
      // Start entering animation after a brief overlap
      const timer = setTimeout(() => {
        setAnimationState('entering');
      }, 150);
      return () => clearTimeout(timer);
    } else {
      // Reset to idle when transition completes
      setAnimationState('idle');
    }
  }, [isTransitioning, questionId]);

  return (
    <div
      className={cn(
        'w-full transition-all duration-400 ease-out mobile-transform',
        animationState === 'exiting' && direction === 'forward' && 'animate-slide-out-left',
        animationState === 'exiting' && direction === 'backward' && 'animate-slide-out-right',
        animationState === 'entering' && direction === 'forward' && 'animate-slide-in-right',
        animationState === 'entering' && direction === 'backward' && 'animate-slide-in-left',
        animationState === 'idle' && 'opacity-100'
      )}
    >
      {children}
    </div>
  );
};
