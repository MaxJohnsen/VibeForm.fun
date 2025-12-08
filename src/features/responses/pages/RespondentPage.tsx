import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRespondent } from '../hooks/useRespondent';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { CompletionScreen } from '../components/CompletionScreen';
import { FormHeader } from '../components/FormHeader';
import { FormNavigation } from '../components/FormNavigation';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { LoadingBar } from '../components/LoadingBar';
import { Loader2 } from 'lucide-react';
import { debounce } from '@/shared/utils/debounce';
import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage } from '@/shared/constants/translations';

export const RespondentPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  const isSubmittingRef = useRef(false);

  // ALL hooks must be called unconditionally at the top
  const {
    sessionState,
    currentQuestion,
    formInfo,
    totalQuestions,
    isLoading,
    isSubmitting,
    isComplete,
    canGoBack,
    turnstileEnabled,
    submitAnswer,
    goBack,
    startNewSession,
  } = useRespondent(formId || '');

  const language = formInfo?.language || 'en';
  const t = useTranslation(language as SupportedLanguage);
  const isLastQuestion = currentQuestion?.position === totalQuestions - 1;
  const isFirstQuestion = currentQuestion?.position === 0;

  // Derived: show welcome unless dismissed or complete/loading
  const showWelcome = !welcomeDismissed && sessionState !== 'complete' && sessionState !== 'loading';
  // Returning user = has active session (already verified by Turnstile before)
  const isReturningUser = sessionState === 'active';

  const handleValidationChange = useCallback((isValid: boolean) => {
    setCanProceed(isValid);
  }, []);

  const handleQuestionSubmit = useCallback((value: any) => {
    setCurrentAnswer(value);
  }, []);

  const handleNext = useCallback(() => {
    if (isSubmittingRef.current) return;
    
    const isRequired = currentQuestion?.settings?.required === true;
    const hasValidAnswer = currentAnswer !== null && 
      (typeof currentAnswer !== 'string' || currentAnswer.trim().length > 0);
    
    if (hasValidAnswer || !isRequired) {
      isSubmittingRef.current = true;
      submitAnswer(hasValidAnswer ? currentAnswer : null);
      setCurrentAnswer(null);
      setCanProceed(false);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  }, [currentAnswer, currentQuestion, submitAnswer]);

  const debouncedHandleNext = useCallback(
    debounce(handleNext, 300),
    [handleNext]
  );

  const handleBack = useCallback(() => {
    if (isFirstQuestion) {
      // Going back to welcome screen
      setWelcomeDismissed(false);
      setCurrentAnswer(null);
      setCanProceed(false);
    } else {
      setCurrentAnswer(null);
      setCanProceed(false);
      goBack();
    }
  }, [isFirstQuestion, goBack]);

  const handleClose = useCallback(() => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      navigate('/');
    }
  }, [navigate]);

  const handleStart = useCallback(async (turnstileToken?: string) => {
    if (isReturningUser) {
      // Returning user - just dismiss welcome, continue existing session
      setWelcomeDismissed(true);
    } else {
      // New user - create session with turnstile token
      setIsStarting(true);
      try {
        await startNewSession(turnstileToken);
        setWelcomeDismissed(true);
      } catch (error) {
        console.error('Failed to start session:', error);
      } finally {
        setIsStarting(false);
      }
    }
  }, [isReturningUser, startNewSession]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === 'Enter' && canProceed && !isSubmitting && !showWelcome && !isSubmittingRef.current) {
        e.preventDefault();
        debouncedHandleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isSubmitting, showWelcome, debouncedHandleNext]);

  // Early returns AFTER all hooks
  if (!formId) {
    return (
      <div className="h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-md w-full p-8 text-center">
          <p className="text-destructive text-xl">Invalid form link</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xl text-foreground">Loading form...</span>
        </div>
      </div>
    );
  }

  if (showWelcome && formInfo) {
    return (
      <div className="h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5">
        <WelcomeScreen
          formTitle={formInfo.title}
          introSettings={formInfo.intro_settings}
          totalQuestions={totalQuestions}
          onStart={handleStart}
          language={language}
          isReturningUser={isReturningUser}
          isStarting={isStarting}
          turnstileEnabled={turnstileEnabled}
        />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col overflow-hidden">
      <LoadingBar isLoading={isSubmitting} />
      
      {!isComplete && currentQuestion && (
        <>
          <FormHeader
            currentQuestion={currentQuestion.position + 1}
            totalQuestions={totalQuestions}
            onClose={handleClose}
          />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 flex items-center justify-center">
            <div className="max-w-3xl w-full py-8 question-container">
              <QuestionRenderer
                key={currentQuestion.id}
                question={currentQuestion}
                onSubmit={handleQuestionSubmit}
                onValidationChange={handleValidationChange}
                formLanguage={language}
              />
            </div>
          </main>

          <FormNavigation
            canGoBack={true}
            isLastQuestion={isLastQuestion}
            isSubmitting={isSubmitting}
            canProceed={canProceed}
            onBack={handleBack}
            onNext={handleNext}
            language={language}
          />
        </>
      )}

      {isComplete && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full">
            <CompletionScreen 
              formTitle={formInfo?.title || 'this form'} 
              endSettings={formInfo?.end_settings}
              language={language}
            />
          </div>
        </div>
      )}

      {isStarting && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xl text-foreground">{t.loading.starting}</span>
          </div>
        </div>
      )}

      {!isComplete && !currentQuestion && !isStarting && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center py-8">
            <p className="text-xl text-muted-foreground">{t.loading.noQuestions}</p>
          </div>
        </div>
      )}
    </div>
  );
};
