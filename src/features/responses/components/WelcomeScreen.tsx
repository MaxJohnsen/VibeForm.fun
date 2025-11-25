import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { IntroSettings } from '@/features/builder/types/screenSettings';
import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage } from '@/shared/constants/translations';

interface WelcomeScreenProps {
  formTitle: string;
  introSettings?: IntroSettings;
  totalQuestions: number;
  onStart: () => void;
  language?: string;
}

export const WelcomeScreen = ({
  formTitle,
  introSettings,
  totalQuestions,
  onStart,
  language = 'en',
}: WelcomeScreenProps) => {
  const t = useTranslation(language as SupportedLanguage);
  const displayTitle = introSettings?.title || formTitle;
  const displayDescription = introSettings?.description;
  const buttonText = introSettings?.buttonText || 'Start';
  const showQuestionCount = introSettings?.showQuestionCount ?? true;
  const showEstimatedTime = introSettings?.showEstimatedTime ?? true;

  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 text-center animate-fade-in">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {displayTitle}
          </h1>
          {displayDescription && (
            <div 
              className="text-lg sm:text-xl prose-intro max-w-xl mx-auto px-4"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />
          )}
        </div>

        {(showEstimatedTime || showQuestionCount) && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {showEstimatedTime && (
              <>
                <span>{t.welcome.takesAbout} {Math.ceil(totalQuestions * 0.25)} {t.welcome.minutes}</span>
                {showQuestionCount && <span>•</span>}
              </>
            )}
            {showQuestionCount && <span>{totalQuestions} {t.welcome.questions}</span>}
          </div>
        )}

        <Button
          onClick={onStart}
          size="lg"
          className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg gap-2 min-h-[48px] active:scale-95 hover-elevate transition-all"
        >
          {buttonText}
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};
