import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg' | 'compact';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  sm: {
    icon: 'text-base sm:text-lg',
    text: 'text-xl sm:text-2xl',
    gap: 'gap-1.5 sm:gap-2',
  },
  md: {
    icon: 'text-2xl sm:text-3xl',
    text: 'text-4xl sm:text-5xl',
    gap: 'gap-2',
  },
  lg: {
    icon: 'text-3xl md:text-4xl',
    text: 'text-5xl md:text-6xl',
    gap: 'gap-2',
  },
  compact: {
    icon: 'text-lg',
    text: 'text-lg',
    gap: 'gap-1',
  },
};

export const Logo = ({ size = 'md', className, animated = false }: LogoProps) => {
  const config = sizeConfig[size];
  const isCompact = size === 'compact';

  return (
    <div
      className={cn(
        'flex items-center',
        config.gap,
        animated && 'animate-fade-in',
        className
      )}
    >
      <i className={cn('fa-solid fa-comment-dot text-primary', config.icon)} />
      {isCompact ? (
        <div className="flex">
          <span className={cn('font-semibold tracking-tight font-archivo text-slate-800', config.text)}>
            F
          </span>
          <span className={cn('font-semibold tracking-tight font-archivo text-primary', config.text)}>
            F
          </span>
        </div>
      ) : (
        <div>
          <span className={cn('font-semibold tracking-tight font-archivo text-slate-800', config.text)}>
            Fair
          </span>
          <span className={cn('font-semibold tracking-tight font-archivo text-primary', config.text)}>
            form
          </span>
        </div>
      )}
    </div>
  );
};
