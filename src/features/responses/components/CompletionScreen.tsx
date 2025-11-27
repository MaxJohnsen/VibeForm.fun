import { Check } from 'lucide-react';
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
  const buttonText = endSettings?.buttonText || t.completion.restart;
  const buttonAction = endSettings?.buttonAction || 'restart';
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
      default:
        window.location.reload();
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 py-8 sm:py-12 px-4">
      <div className="rounded-full bg-primary/10 p-5 sm:p-6">
        <Check className="h-12 w-12 sm:h-16 sm:w-16 text-primary" strokeWidth={2.5} />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-md whitespace-pre-wrap">
          {message}
        </p>
      </div>

      <Button
        onClick={handleButtonClick}
        variant="outline"
        size="lg"
        className="min-h-[44px]"
      >
        {buttonText}
      </Button>
    </div>
  );
};
