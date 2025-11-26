import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi } from '@/features/forms/api/formsApi';
import { useLottery } from '../hooks/useLottery';
import { DrawControls } from '../components/DrawControls';
import { WinnerCard } from '../components/WinnerCard';
import { DrawHistory } from '../components/DrawHistory';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { Winner } from '../api/lotteryApi';
import { ROUTES } from '@/shared/constants/routes';

export const LotteryPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [currentWinners, setCurrentWinners] = useState<Winner[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  const {
    drawHistory,
    isLoadingHistory,
    hasNameQuestion,
    isLoadingNameQuestion,
    drawWinners,
    isDrawing,
    deleteDraw,
    isDeletingDraw,
  } = useLottery(formId!);

  const handleDraw = async (winnerCount: number, namedOnly: boolean) => {
    try {
      const winners = await drawWinners({
        formId: formId!,
        winnerCount,
        namedOnly,
      });
      setCurrentWinners(winners);
      setShowConfetti(true);
      
      // Reset confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      // Error handled by mutation
      console.error('Draw error:', error);
    }
  };

  if (isLoadingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-muted-foreground">Form not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
      <ConfettiCelebration trigger={showConfetti} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 sticky top-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(ROUTES.getResponsesDashboardRoute(formId!))}
                className="hover:bg-background/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{form.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">🎲 The Lottery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <DrawControls
              formId={formId!}
              hasNameQuestion={hasNameQuestion}
              onDraw={handleDraw}
              isDrawing={isDrawing}
            />
          </div>

          {/* Right Column: Winners & History */}
          <div className="space-y-6">
            {/* Current Winners */}
            {currentWinners.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground text-center">
                  🎉 {currentWinners.length === 1 ? 'Winner' : 'Winners'}!
                </h2>
                <div className="grid gap-4">
                  {currentWinners.map((winner, index) => (
                    <WinnerCard
                      key={winner.responseId}
                      winner={winner}
                      index={index}
                      total={currentWinners.length}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Draw History */}
            {isLoadingHistory ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <DrawHistory
                draws={drawHistory}
                onDelete={deleteDraw}
                isDeletingDraw={isDeletingDraw}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
