import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lotteryApi, DrawOptions } from '../api/lotteryApi';
import { toast } from '@/hooks/use-toast';

export const useLottery = (formId: string) => {
  const queryClient = useQueryClient();

  const drawHistoryQuery = useQuery({
    queryKey: ['lottery-draws', formId],
    queryFn: () => lotteryApi.getDrawHistory(formId),
  });

  const hasNameQuestionQuery = useQuery({
    queryKey: ['lottery-name-question', formId],
    queryFn: () => lotteryApi.checkHasNameQuestion(formId),
  });

  const drawMutation = useMutation({
    mutationFn: (options: DrawOptions) => lotteryApi.drawWinners(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery-draws', formId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Draw Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (drawId: string) => lotteryApi.deleteDraw(drawId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery-draws', formId] });
      toast({
        title: 'Draw Deleted',
        description: 'The lottery draw has been removed from history.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete draw',
        variant: 'destructive',
      });
    },
  });

  return {
    drawHistory: drawHistoryQuery.data || [],
    isLoadingHistory: drawHistoryQuery.isLoading,
    hasNameQuestion: hasNameQuestionQuery.data || false,
    isLoadingNameQuestion: hasNameQuestionQuery.isLoading,
    drawWinners: drawMutation.mutateAsync,
    isDrawing: drawMutation.isPending,
    deleteDraw: deleteMutation.mutate,
    isDeletingDraw: deleteMutation.isPending,
  };
};
