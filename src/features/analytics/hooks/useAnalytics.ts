import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export interface AnalyticsStats {
  totalSubmissions: number;
  completedSubmissions: number;
  completionRate: number;
  averageCompletionTime: number | null;
  primaryDropoffQuestion: {
    questionId: string;
    questionLabel: string;
    dropoffRate: number;
  } | null;
}

export const useAnalytics = (formId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', formId],
    queryFn: () => analyticsApi.fetchFormAnalytics(formId),
    refetchInterval: 30000, // Refetch every 30 seconds as backup to realtime
  });

  const stats: AnalyticsStats | null = data ? calculateStats(data) : null;

  return {
    responses: data?.responses || [],
    questions: data?.questions || [],
    stats,
    isLoading,
    error,
    refetch,
  };
};

function calculateStats(data: Awaited<ReturnType<typeof analyticsApi.fetchFormAnalytics>>): AnalyticsStats {
  const { responses, questions } = data;
  
  const totalSubmissions = responses.length;
  const completedSubmissions = responses.filter(r => r.status === 'completed').length;
  const completionRate = totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0;
  
  // Calculate average completion time
  const completedWithTime = responses.filter(r => r.completed_at);
  const averageCompletionTime = completedWithTime.length > 0
    ? completedWithTime.reduce((sum, r) => {
        const duration = (new Date(r.completed_at!).getTime() - new Date(r.started_at).getTime()) / 1000;
        return sum + duration;
      }, 0) / completedWithTime.length
    : null;
  
  // Calculate drop-off rates for each question
  const questionDropoffs = questions.map(question => {
    const answeredCount = responses.filter(r => 
      r.answers.some(a => a.question_id === question.id)
    ).length;
    
    const dropoffRate = totalSubmissions > 0 
      ? ((totalSubmissions - answeredCount) / totalSubmissions) * 100 
      : 0;
    
    return {
      questionId: question.id,
      questionLabel: question.label,
      dropoffRate,
    };
  });
  
  // Find primary drop-off point (highest drop-off rate)
  const primaryDropoff = questionDropoffs.length > 0
    ? questionDropoffs.reduce((max, current) => 
        current.dropoffRate > max.dropoffRate ? current : max
      )
    : null;
  
  return {
    totalSubmissions,
    completedSubmissions,
    completionRate,
    averageCompletionTime,
    primaryDropoffQuestion: primaryDropoff,
  };
}
