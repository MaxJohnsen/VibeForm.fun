import { useState, useEffect, useCallback } from 'react';
import { responsesApi } from '../api/responsesApi';
import { useToast } from '@/hooks/use-toast';

export type SessionState = 'loading' | 'new' | 'active' | 'complete';

export const useRespondent = (formId: string) => {
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [formInfo, setFormInfo] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState<boolean>(false);
  const { toast } = useToast();

  // Derived state for backwards compatibility
  const isLoading = sessionState === 'loading';
  const isComplete = sessionState === 'complete';

  // Refetch form info to get latest language settings
  const refetchFormInfo = useCallback(async () => {
    if (!sessionToken) return;
    
    try {
      const data = await responsesApi.resumeResponse(sessionToken);
      // Only update form info (language, settings) without affecting question flow
      setFormInfo(data.form);
    } catch (error) {
      console.error('Failed to refetch form info:', error);
    }
  }, [sessionToken]);

  // Poll for form info updates every 3 seconds when viewing the form
  useEffect(() => {
    if (!sessionToken || sessionState === 'complete') return;

    const intervalId = setInterval(() => {
      refetchFormInfo();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [sessionToken, sessionState, refetchFormInfo]);

  // Also refetch when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      refetchFormInfo();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchFormInfo]);

  // Initialize or resume session
  useEffect(() => {
    const initSession = async () => {
      if (!formId) {
        setSessionState('new');
        return;
      }

      try {
        // Check for existing session token in localStorage
        const existingToken = localStorage.getItem(`response_session_${formId}`);
        
        if (existingToken) {
          try {
            // Try to resume existing session
            const data = await responsesApi.resumeResponse(existingToken);
            
            setSessionToken(data.sessionToken);
            setFormInfo(data.form);
            setTotalQuestions(data.totalQuestions);
            
            if (data.isComplete) {
              setSessionState('complete');
              setCurrentQuestion(null);
              setCanGoBack(false);
            } else {
              setCurrentQuestion(data.question);
              setCanGoBack(!!data.question);
              setSessionState('active');
            }
            
            console.log('Session resumed successfully');
            return; // Successfully resumed, we're done
          } catch (resumeError) {
            // Resume failed, clear stale token
            console.log('Failed to resume session:', resumeError);
            localStorage.removeItem(`response_session_${formId}`);
          }
        }

        // No existing session or resume failed - fetch form info for WelcomeScreen
        const formData = await responsesApi.getFormInfo(formId);
        setFormInfo(formData.form);
        setTotalQuestions(formData.totalQuestions);
        setTurnstileEnabled(formData.turnstileEnabled ?? false);
        setSessionState('new');
        console.log('Form info loaded for WelcomeScreen');
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setSessionState('new');
        toast({
          title: 'Error',
          description: 'Failed to load form. Please try again.',
          variant: 'destructive',
        });
      }
    };

    initSession();
  }, [formId]);

  const startNewSession = async (turnstileToken?: string) => {
    const data = await responsesApi.startResponse(formId, turnstileToken);
    setSessionToken(data.sessionToken);
    setFormInfo(data.form);
    setCurrentQuestion(data.question);
    setTotalQuestions(data.totalQuestions);
    setCanGoBack(false);
    setSessionState('active');
    
    localStorage.setItem(`response_session_${formId}`, data.sessionToken);
  };

  const submitAnswer = async (answerValue: any) => {
    if (!sessionToken || !currentQuestion) return;

    setIsSubmitting(true);
    try {
      const data = await responsesApi.submitAnswer(
        sessionToken,
        currentQuestion.id,
        answerValue
      );

      if (data.isComplete) {
        setSessionState('complete');
        localStorage.removeItem(`response_session_${formId}`);
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setCanGoBack(true);
      }

      setTotalQuestions(data.totalQuestions);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = async () => {
    if (!sessionToken || !currentQuestion || !canGoBack) return;

    setIsSubmitting(true);
    try {
      const data = await responsesApi.navigateBack(sessionToken, currentQuestion.id);
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      
      // Disable back button if we're back at the first question
      // The navigate-back endpoint will fail if there's only one answer
      setCanGoBack(true); // Keep enabled until we hit the first question
    } catch (error: any) {
      console.error('Failed to navigate back:', error);
      
      // If we hit the first question, disable back button
      if (error?.message?.includes('first question') || error?.message?.includes('No previous')) {
        setCanGoBack(false);
      }
      
      toast({
        title: 'Error',
        description: 'Failed to go back. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sessionState,
    sessionToken,
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
  };
};
