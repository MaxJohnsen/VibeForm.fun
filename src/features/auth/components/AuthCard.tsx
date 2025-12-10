import { GlassCard } from '@/shared/ui';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard = ({ children, title, subtitle }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <GlassCard padding="lg" className="max-w-[420px] w-full">
        <div className="flex flex-col items-center gap-6">
          {/* Brand Logo */}
          <h1 className="text-5xl font-bold tracking-tight text-primary font-heading animate-fade-in">
            Fairform
          </h1>

          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center space-y-2">
              {title && <h2 className="text-2xl font-semibold text-foreground font-heading">{title}</h2>}
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