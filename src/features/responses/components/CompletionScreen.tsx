import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EndSettings } from '@/features/builder/types/screenSettings';
import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage } from '@/shared/constants/translations';

interface CompletionScreenProps {
  formTitle: string;
  endSettings?: EndSettings;
  language?: string;
}

export const CompletionScreen = ({ formTitle, endSettings, language = 'en' }: CompletionScreenProps) => {
  const t = useTranslation(language as SupportedLanguage);
  const title = endSettings?.title || t.completion.defaultTitle;
  const message = endSettings?.message || t.completion.defaultMessage;
  const buttonText = endSettings?.buttonText || t.completion.close;
  const buttonAction = endSettings?.buttonAction || 'close';
  const redirectUrl = endSettings?.redirectUrl;

  const handleButtonClick = () => {
    switch (buttonAction) {
      case 'redirect':
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/';
        }
        break;
      case 'restart':
        window.location.reload();
        break;
      case 'close':
      default:
        window.location.href = '/';
        break;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center text-center py-8 sm:py-12 px-4 min-h-[60vh]">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative glass-panel rounded-3xl p-8 sm:p-12 max-w-lg w-full space-y-6 sm:space-y-8">
        {/* Icon with Double Ring */}
        <div className="flex justify-center animate-completion-bounce">
          <div className="relative">
            {/* Outer Ring - Soft Gradient */}
            <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-xl" />
            
            {/* Inner Ring - Primary Glow */}
            <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-6 sm:p-8 shadow-lg shadow-primary/20">
              <div className="rounded-full bg-primary/10 p-4 sm:p-5 backdrop-blur-sm">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Text Content */}
        <div className="space-y-3 animate-completion-fade-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto whitespace-pre-wrap leading-relaxed">
            {message}
          </p>
        </div>

        {/* Button */}
        <div className="animate-completion-fade-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={handleButtonClick}
            variant="outline"
            size="lg"
            className="min-h-[44px] hover-elevate"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
