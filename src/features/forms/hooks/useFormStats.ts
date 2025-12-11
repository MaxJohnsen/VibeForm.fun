import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FormStats {
  responseCount: number;
  completedCount: number;
  questionCount: number;
  integrationCount: number;
  weeklyResponses: number[];
  lastResponseAt: string | null;
}

export type FormStatsMap = Record<string, FormStats>;

export const useFormStats = (formIds: string[]) => {
  return useQuery({
    queryKey: ['form-stats', formIds.sort().join(',')],
    queryFn: async (): Promise<FormStatsMap> => {
      if (formIds.length === 0) return {};

      const { data, error } = await supabase.rpc('get_form_stats', {
        p_form_ids: formIds,
      });

      if (error) {
        console.error('Error fetching form stats:', error);
        return {};
      }

      const statsMap: FormStatsMap = {};
      (data || []).forEach((row: any) => {
        statsMap[row.form_id] = {
          responseCount: Number(row.response_count) || 0,
          completedCount: Number(row.completed_count) || 0,
          questionCount: Number(row.question_count) || 0,
          integrationCount: Number(row.integration_count) || 0,
          weeklyResponses: (row.weekly_responses || []).map((n: any) => Number(n) || 0),
          lastResponseAt: row.last_response_at || null,
        };
      });

      return statsMap;
    },
    enabled: formIds.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
};
