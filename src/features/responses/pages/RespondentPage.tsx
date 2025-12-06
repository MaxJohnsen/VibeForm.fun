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

export const RespondentPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const isSubmittingRef = useRef(false);

  if (!formId) {
    return (
      <div className="h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-md w-full p-8 text-center">
          <p className="text-destructive text-xl">Invalid form link</p>
        </div>
      </div>
    );
  }

  const {
    currentQuestion,
    formInfo,
    totalQuestions,
    isLoading,
    isSubmitting,
    isComplete,
    canGoBack,
    submitAnswer,
    goBack,
    startNewSession,
  } = useRespondent(formId);

  const language = formInfo?.language || 'en';
  const isLastQuestion = currentQuestion?.position === totalQuestions - 1;
  const isFirstQuestion = currentQuestion?.position === 0;

  const handleValidationChange = useCallback((isValid: boolean) => {
    setCanProceed(isValid);
  }, []);

  const handleQuestionSubmit = useCallback((value: any) => {
    setCurrentAnswer(value);
    // Don't set canProceed here - let onValidationChange handle it
  }, []);

  const handleNext = useCallback(() => {
    if (isSubmittingRef.current) return;
    
    const isRequired = currentQuestion?.settings?.required === true;
    const hasValidAnswer = currentAnswer !== null && 
      (typeof currentAnswer !== 'string' || currentAnswer.trim().length > 0);
    
    // Allow proceeding if we have a valid answer OR if the question is optional
    if (hasValidAnswer || !isRequired) {
      isSubmittingRef.current = true;
      submitAnswer(hasValidAnswer ? currentAnswer : null);
      setCurrentAnswer(null);
      setCanProceed(false);
      // Reset after a short delay to prevent rapid re-submission
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  }, [currentAnswer, currentQuestion, submitAnswer]);

  // Debounced version for keyboard input
  const debouncedHandleNext = useCallback(
    debounce(handleNext, 300),
    [handleNext]
  );

  const handleBack = useCallback(() => {
    if (isFirstQuestion) {
      // Return to welcome screen on first question
      setShowWelcome(true);
      setCurrentAnswer(null);
      setCanProceed(false);
    } else {
      // Navigate to previous question
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept Enter key inside textareas (for multiline input)
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') {
        return; // Allow normal textarea behavior (new line on Enter)
      }
      
      if (e.key === 'Enter' && canProceed && !isSubmitting && !showWelcome && !isSubmittingRef.current) {
        e.preventDefault();
        debouncedHandleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isSubmitting, showWelcome, debouncedHandleNext]);

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

  const handleStartWithTurnstile = useCallback((turnstileToken?: string) => {
    // Start new session with turnstile token for verification
    startNewSession(turnstileToken);
    setShowWelcome(false);
  }, [startNewSession]);

  if (showWelcome && formInfo && !isComplete) {
    return (
      <div className="h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5">
        <WelcomeScreen
          formTitle={formInfo.title}
          introSettings={formInfo.intro_settings}
          totalQuestions={totalQuestions}
          onStart={handleStartWithTurnstile}
          language={language}
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

      {!isComplete && !currentQuestion && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center py-8">
            <p className="text-xl text-muted-foreground">No questions available</p>
          </div>
        </div>
      )}
    </div>
  );
};
