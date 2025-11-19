import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRespondent } from '../hooks/useRespondent';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { CompletionScreen } from '../components/CompletionScreen';
import { FormHeader } from '../components/FormHeader';
import { FormNavigation } from '../components/FormNavigation';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { QuestionTransition } from '../components/QuestionTransition';
import { QuestionSkeleton } from '../components/QuestionSkeleton';
import { ProgressBar } from '../components/ProgressBar';
import { Loader2 } from 'lucide-react';
import { debounce } from '@/shared/utils/debounce';

export const RespondentPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [transitionState, setTransitionState] = useState<'idle' | 'transitioning'>('idle');
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const isSubmittingRef = useRef(false);
  const transitionTimerRef = useRef<NodeJS.Timeout>();

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
  } = useRespondent(formId);

  const isLastQuestion = currentQuestion?.position === totalQuestions - 1;
  const isFirstQuestion = currentQuestion?.position === 0;

  const handleValidationChange = useCallback((isValid: boolean) => {
    setCanProceed(isValid);
  }, []);

  const handleQuestionSubmit = useCallback((value: any) => {
    setCurrentAnswer(value);
    setCanProceed(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentAnswer !== null && !isSubmittingRef.current) {
      // Start transition immediately for instant feedback
      setTransitionState('transitioning');
      setTransitionDirection('forward');
      
      // Show skeleton if loading takes longer than animation
      transitionTimerRef.current = setTimeout(() => {
        if (isSubmitting) {
          setShowSkeleton(true);
        }
      }, 500);
      
      // Submit answer
      isSubmittingRef.current = true;
      submitAnswer(currentAnswer);
      setCurrentAnswer(null);
      setCanProceed(false);
      
      // Reset after a short delay to prevent rapid re-submission
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  }, [currentAnswer, submitAnswer, isSubmitting]);

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
      // Start backward transition
      setTransitionState('transitioning');
      setTransitionDirection('backward');
      
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

  // Clean up transition state when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTransitionState('idle');
      setShowSkeleton(false);
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    }
  }, [currentQuestion?.id]);

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

  if (showWelcome && formInfo && !isComplete) {
    return (
      <div className="h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5">
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
    <div className="h-[100dvh] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col overflow-hidden">
      {!isComplete && currentQuestion && (
        <>
          <div className="flex-shrink-0">
            <FormHeader
              currentQuestion={currentQuestion.position + 1}
              totalQuestions={totalQuestions}
              onClose={handleClose}
            />
            <div className="px-4 sm:px-6 pt-4">
              <ProgressBar
                current={currentQuestion.position + 1}
                total={totalQuestions}
              />
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 flex items-center justify-center">
            <QuestionTransition
              questionId={currentQuestion.id}
              direction={transitionDirection}
              isTransitioning={transitionState === 'transitioning'}
            >
              {showSkeleton ? (
                <QuestionSkeleton />
              ) : (
                <div className="max-w-3xl w-full py-8 question-container">
                  <QuestionRenderer
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onSubmit={handleQuestionSubmit}
                    onValidationChange={handleValidationChange}
                  />
                </div>
              )}
            </QuestionTransition>
          </main>

          <FormNavigation
            canGoBack={true}
            isLastQuestion={isLastQuestion}
            isSubmitting={isSubmitting}
            canProceed={canProceed}
            onBack={handleBack}
            onNext={handleNext}
          />
        </>
      )}

      {isComplete && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full">
            <CompletionScreen formTitle={formInfo?.title || 'this form'} />
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
