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
    gap: 'gap-2 sm:gap-2.5',
    tracking: 'tracking-[-0.02em]',
  },
  md: {
    icon: 'text-2xl sm:text-3xl',
    text: 'text-4xl sm:text-5xl',
    gap: 'gap-2.5 sm:gap-3',
    tracking: 'tracking-[-0.03em]',
  },
  lg: {
    icon: 'text-3xl md:text-4xl',
    text: 'text-5xl md:text-6xl',
    gap: 'gap-3',
    tracking: 'tracking-[-0.03em]',
  },
  compact: {
    icon: 'text-lg',
    text: 'text-lg',
    gap: 'gap-1.5',
    tracking: 'tracking-[-0.01em]',
  },
};

export const Logo = ({ size = 'md', className, animated = false }: LogoProps) => {
  const config = sizeConfig[size];
  const isCompact = size === 'compact';

  return (
    <div
      className={cn(
        'flex items-center group',
        config.gap,
        animated && 'animate-fade-in',
        className
      )}
    >
      <i 
        className={cn(
          'fa-solid fa-comment-dots text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg]', 
          config.icon
        )} 
      />
      {isCompact ? (
        <div className="flex">
          <span className={cn('font-black font-logo text-foreground transition-colors duration-200', config.text, config.tracking)}>
            F
          </span>
          <span className={cn('font-black font-logo text-primary transition-colors duration-200', config.text, config.tracking)}>
            F
          </span>
        </div>
      ) : (
        <div className="flex">
          <span className={cn('font-black font-logo text-foreground transition-colors duration-200', config.text, config.tracking)}>
            Fair
          </span>
          <span className={cn('font-black font-logo text-primary transition-colors duration-200', config.text, config.tracking)}>
            form
          </span>
        </div>
      )}
    </div>
  );
};
