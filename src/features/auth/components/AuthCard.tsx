import { GlassCard } from '@/shared/ui';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard = ({ children, title, subtitle }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard>
        <div className="flex flex-col items-center gap-6">
          {/* Brand Logo */}
          <div className="relative">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
              VibeForm
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center space-y-2">
              {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
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
