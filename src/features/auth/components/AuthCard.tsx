import { GlassCard } from '@/shared/ui';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard = ({ children, title, subtitle }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-dots">
      <GlassCard padding="lg" className="max-w-[420px] w-full">
        <div className="flex flex-col items-center gap-6">
          {/* Brand Logo */}
          <div className="relative">
            <span className="text-4xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
              Fairform
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center space-y-2">
              {title && <h1>{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </GlassCard>
    </div>
  );
};
