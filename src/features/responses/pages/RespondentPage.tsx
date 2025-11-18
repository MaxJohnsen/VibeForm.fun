import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRespondent } from '../hooks/useRespondent';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { CompletionScreen } from '../components/CompletionScreen';
import { FormHeader } from '../components/FormHeader';
import { FormNavigation } from '../components/FormNavigation';
import { WelcomeScreen } from '../components/WelcomeScreen';
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
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
  } = useRespondent(formId);

  const isLastQuestion = currentQuestion?.position === totalQuestions - 1;

  const handleValidationChange = useCallback((isValid: boolean) => {
    setCanProceed(isValid);
  }, []);

  const handleQuestionSubmit = useCallback((value: any) => {
    setCurrentAnswer(value);
    setCanProceed(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentAnswer !== null && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      submitAnswer(currentAnswer);
      setCurrentAnswer(null);
      setCanProceed(false);
      // Reset after a short delay to prevent rapid re-submission
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  }, [currentAnswer, submitAnswer]);

  // Debounced version for keyboard input
  const debouncedHandleNext = useCallback(
    debounce(handleNext, 300),
    [handleNext]
  );

  const handleClose = useCallback(() => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      navigate('/');
    }
  }, [navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed && !isSubmitting && !showWelcome && !isSubmittingRef.current) {
        e.preventDefault();
        debouncedHandleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isSubmitting, showWelcome, debouncedHandleNext]);

  // Reset answer state whenever the question changes (forward or backward navigation)
  useEffect(() => {
    if (currentQuestion?.id) {
      setCurrentAnswer(null);
      setCanProceed(false);
    }
  }, [currentQuestion?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xl text-foreground">Loading form...</span>
        </div>
      </div>
    );
  }

  if (showWelcome && formInfo && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <WelcomeScreen
          formTitle={formInfo.title}
          formDescription={formInfo.description || undefined}
          totalQuestions={totalQuestions}
          onStart={() => setShowWelcome(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {!isComplete && currentQuestion && (
        <>
          <FormHeader
            currentQuestion={currentQuestion.position + 1}
            totalQuestions={totalQuestions}
            onClose={handleClose}
          />

          <main className="min-h-screen pt-24 pb-32 px-6 flex items-center justify-center">
            <div className="max-w-3xl w-full">
          <QuestionRenderer
            key={currentQuestion.id}
            question={currentQuestion}
            onSubmit={handleQuestionSubmit}
            onValidationChange={handleValidationChange}
          />
            </div>
          </main>

          <FormNavigation
            canGoBack={canGoBack}
            isLastQuestion={isLastQuestion}
            isSubmitting={isSubmitting}
            canProceed={canProceed}
            onBack={goBack}
            onNext={handleNext}
          />
        </>
      )}

      {isComplete && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-2xl w-full">
            <CompletionScreen formTitle={formInfo?.title || 'this form'} />
          </div>
        </div>
      )}

      {!isComplete && !currentQuestion && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center py-8">
            <p className="text-xl text-muted-foreground">No questions available</p>
          </div>
        </div>
      )}
    </div>
  );
};
