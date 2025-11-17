import { useParams } from 'react-router-dom';
import { useRespondent } from '../hooks/useRespondent';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { ProgressBar } from '../components/ProgressBar';
import { CompletionScreen } from '../components/CompletionScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';

export const RespondentPage = () => {
  const { formId } = useParams<{ formId: string }>();
  
  if (!formId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <p className="text-destructive">Invalid form link</p>
        </GlassCard>
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg">Loading form...</span>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        {!isComplete && formInfo && (
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{formInfo.title}</h1>
            {formInfo.description && (
              <p className="text-lg text-muted-foreground">{formInfo.description}</p>
            )}
          </div>
        )}

        <GlassCard className="p-8">
          {isComplete ? (
            <CompletionScreen formTitle={formInfo?.title || 'this form'} />
          ) : currentQuestion ? (
            <div className="space-y-8">
              <ProgressBar
                current={currentQuestion.position + 1}
                total={totalQuestions}
              />

              <QuestionRenderer
                question={currentQuestion}
                onSubmit={submitAnswer}
                isSubmitting={isSubmitting}
              />

              {canGoBack && (
                <Button
                  variant="ghost"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No questions available</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
