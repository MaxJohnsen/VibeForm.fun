import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard = ({ children, title, subtitle }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 via-accent/5 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-accent/8 via-primary/5 to-transparent rounded-full blur-3xl translate-y-1/2" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      
      {/* Card */}
      <div
        className={cn(
          'relative z-10 w-full max-w-[440px]',
          'bg-card/95 backdrop-blur-sm',
          'border border-border/60',
          'rounded-3xl',
          'shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]',
          'p-10 sm:p-12',
          'animate-fade-in'
        )}
      >
        <div className="flex flex-col items-center gap-8">
          {/* Brand Logo with gradient */}
          <div className="relative">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-[hsl(var(--gradient-start))] via-primary to-[hsl(var(--gradient-end))] bg-clip-text text-transparent font-heading">
              Fairform
            </h1>
            {/* Subtle glow under logo */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-xl" />
          </div>

          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center space-y-2">
              {title && (
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground font-heading">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-base text-muted-foreground max-w-xs">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
