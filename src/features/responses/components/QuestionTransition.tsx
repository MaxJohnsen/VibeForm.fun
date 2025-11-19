import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface QuestionTransitionProps {
  children: ReactNode;
  phase: 'sliding-out' | 'loading' | 'fading-in' | 'idle';
  direction?: 'forward' | 'backward';
}

export const QuestionTransition = ({
  children,
  phase,
  direction = 'forward',
}: QuestionTransitionProps) => {
  return (
    <div
      className={cn(
        'w-full mobile-transform',
        phase === 'sliding-out' && direction === 'forward' && 'animate-slide-out-left',
        phase === 'sliding-out' && direction === 'backward' && 'animate-slide-out-right',
        phase === 'fading-in' && 'animate-fade-in',
        phase === 'idle' && 'opacity-100'
      )}
    >
      {children}
    </div>
  );
};
