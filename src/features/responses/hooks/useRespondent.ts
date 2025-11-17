import { useState, useEffect } from 'react';
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

  // Initialize or resume session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check for existing session
        const existingToken = localStorage.getItem(`response_session_${formId}`);
        
        if (existingToken) {
          // TODO: Add an endpoint to resume session
          // For now, start a new session
          await startNewSession();
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
    if (!sessionToken || !canGoBack) return;

    setIsSubmitting(true);
    try {
      const data = await responsesApi.navigateBack(sessionToken);
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      
      // Check if this was the first question
      // Simple check: if we can't go further back, disable the button
      // In a more complex implementation, you'd track answer count
    } catch (error) {
      console.error('Failed to navigate back:', error);
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
