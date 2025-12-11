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
          {/* Brand Logo - Two-Tone */}
          <div className="animate-fade-in">
            <span className="text-5xl md:text-6xl font-black tracking-tight font-logo text-slate-800">
              Fair
            </span>
            <span className="text-5xl md:text-6xl font-black tracking-tight font-logo text-primary">
              form
            </span>
          </div>

          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center space-y-3">
              {title && <h1>{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>}
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </GlassCard>
    </div>
  );
};
