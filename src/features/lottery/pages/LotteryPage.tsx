import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi } from '@/features/forms/api/formsApi';
import { useLottery } from '../hooks/useLottery';
import { DrawControls } from '../components/DrawControls';
import { WinnerDisplayCard } from '../components/WinnerDisplayCard';
import { DrawHistory } from '../components/DrawHistory';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { Winner, lotteryApi } from '../api/lotteryApi';
import { ROUTES } from '@/shared/constants/routes';

type DisplayState = 'idle' | 'loading' | 'animating' | 'revealed';

export const LotteryPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [displayState, setDisplayState] = useState<DisplayState>('idle');
  const [currentWinners, setCurrentWinners] = useState<Winner[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [candidates, setCandidates] = useState<Winner[]>([]);

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
    refreshDrawHistory,
  } = useLottery(formId!);

  const handleDraw = async (winnerCount: number, namedOnly: boolean) => {
    try {
      // Set loading state
      setDisplayState('loading');
      
      // Fetch candidates for animation
      const randomCandidates = await lotteryApi.getCandidates(formId!, namedOnly, 20);
      setCandidates(randomCandidates);
      
      // Draw actual winners
      const winners = await drawWinners({
        formId: formId!,
        winnerCount,
        namedOnly,
      });
      setCurrentWinners(winners);
      
      // Start animation
      setDisplayState('animating');
    } catch (error) {
      setDisplayState('idle');
      console.error('Draw error:', error);
    }
  };

  const handleAnimationComplete = () => {
    setDisplayState('revealed');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    refreshDrawHistory();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <ConfettiCelebration trigger={showConfetti} />

      {/* Header */}
      <div className="border-b border-border/50 glass-panel sticky top-0 z-10 backdrop-blur-xl bg-background/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(ROUTES.getResponsesDashboardRoute(formId!))}
                className="hover:bg-background/50"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div>
                <h1 className="text-base md:text-xl font-bold text-foreground">{form.title}</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">🎲 The Lottery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 px-4 sm:px-6 pb-6 min-h-0">
        <div className="max-w-6xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column: Controls + History (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              <DrawControls
                formId={formId!}
                hasNameQuestion={hasNameQuestion}
                onDraw={handleDraw}
                isDrawing={isDrawing || displayState === 'loading' || displayState === 'animating'}
              />

              {/* Draw History */}
              {isLoadingHistory ? (
                <Skeleton className="h-32 w-full rounded-2xl" />
              ) : drawHistory.length > 0 ? (
                <DrawHistory
                  draws={drawHistory}
                  onDelete={deleteDraw}
                  isDeletingDraw={isDeletingDraw}
                />
              ) : null}
            </div>

            {/* Right Column: Winner Display (2/3) */}
            <div className="lg:col-span-2 flex flex-col min-h-[600px]">
              <WinnerDisplayCard
                state={displayState}
                candidates={candidates}
                winners={currentWinners}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
