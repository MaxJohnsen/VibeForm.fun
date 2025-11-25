import { useState, useEffect, useCallback } from 'react';
import { responsesApi } from '../api/responsesApi';
import { useToast } from '@/hooks/use-toast';

export const useRespondent = (formId: string) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [formInfo, setFormInfo] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const { toast } = useToast();

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

  // Refetch form info when window regains focus (e.g., switching from builder)
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
              setIsComplete(true);
              setCurrentQuestion(null);
              setCanGoBack(false);
            } else {
              setCurrentQuestion(data.question);
              // Enable back button if we have a current question (means we've answered at least one)
              setCanGoBack(!!data.question);
            }
            
            console.log('Session resumed successfully');
          } catch (resumeError) {
            // If resume fails, start a new session
            console.log('Failed to resume session, starting new one:', resumeError);
            localStorage.removeItem(`response_session_${formId}`);
            await startNewSession();
          }
        } else {
          await startNewSession();
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast({
          title: 'Error',
          description: 'Failed to load form. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [formId]);

  const startNewSession = async () => {
    const data = await responsesApi.startResponse(formId);
    setSessionToken(data.sessionToken);
    setFormInfo(data.form);
    setCurrentQuestion(data.question);
    setTotalQuestions(data.totalQuestions);
    setCanGoBack(false);
    
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
        setIsComplete(true);
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
    sessionToken,
    currentQuestion,
    formInfo,
    totalQuestions,
    isLoading,
    isSubmitting,
    isComplete,
    canGoBack,
    submitAnswer,
    goBack,
  };
};
