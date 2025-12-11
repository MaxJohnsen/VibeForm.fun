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
            <span 
              className="text-5xl md:text-6xl font-black tracking-tight text-secondary-foreground animate-fade-in"
              style={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 4px 12px hsl(350 45% 28% / 0.25)' 
              }}
            >
              Fairform
            </span>
            <div className="absolute -inset-4 bg-secondary-foreground/20 blur-3xl -z-10" />
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
