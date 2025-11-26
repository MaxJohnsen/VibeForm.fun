import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi } from '@/features/forms/api/formsApi';
import { useAnalytics } from '../hooks/useAnalytics';
import { useRealtimeResponses } from '../hooks/useRealtimeResponses';
import { StatisticsCard } from '../components/StatisticsCard';
import { ResponsesList } from '../components/ResponsesList';
import { QuestionPerformance } from '../components/QuestionPerformance';
import { ExportButton } from '../components/ExportButton';
import { ROUTES } from '@/shared/constants/routes';
import { formatDuration } from '@/shared/utils/timeFormatter';


export const DashboardPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  const { responses, questions, stats, isLoading, refetch } = useAnalytics(formId!);

  // Subscribe to realtime updates
  useRealtimeResponses(formId!, refetch);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border/50 glass-panel sticky top-0 z-10 backdrop-blur-xl bg-background/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -ml-2 md:ml-0"
                onClick={() => navigate(ROUTES.getBuilderRoute(formId!))}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-semibold truncate">{form?.title || 'Form'}</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
                  Real-time response tracking and statistics
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <ExportButton formId={formId!} formTitle={form?.title || 'Form'} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <StatisticsCard
            icon={CheckCircle2}
            label="Completion Rate"
            value={`${stats?.completionRate.toFixed(0)}%`}
            subtitle={`${stats?.completedSubmissions} of ${stats?.totalSubmissions} completed`}
          />
          <StatisticsCard
            icon={Users}
            label="Total Submissions"
            value={stats?.totalSubmissions || 0}
            subtitle={`${stats?.completedSubmissions} completed, ${(stats?.totalSubmissions || 0) - (stats?.completedSubmissions || 0)} incomplete`}
          />
          <StatisticsCard
            icon={Clock}
            label="Avg. Completion Time"
            value={stats?.averageCompletionTime ? formatDuration(Math.round(stats.averageCompletionTime)) : 'N/A'}
            subtitle={stats?.primaryDropoffQuestion ? `Most drop at: ${stats.primaryDropoffQuestion.questionLabel}` : 'No drop-offs detected'}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Question Performance - First on mobile */}
          <div className="order-1 lg:order-2">
            <QuestionPerformance questions={questions} responses={responses} formId={formId} />
          </div>

          {/* Recent Responses - Second on mobile */}
          <div className="order-2 lg:order-1">
            <ResponsesList responses={responses} totalQuestions={questions.length} questions={questions} />
          </div>
        </div>
      </div>
    </div>
  );
};
