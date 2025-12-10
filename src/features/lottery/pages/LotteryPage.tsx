import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { formsApi } from '@/features/forms/api/formsApi';
import { useLottery } from '../hooks/useLottery';
import { DrawControls } from '../components/DrawControls';
import { WinnerDisplayCard } from '../components/WinnerDisplayCard';
import { DrawHistory } from '../components/DrawHistory';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { Winner, lotteryApi } from '../api/lotteryApi';
import { ROUTES } from '@/shared/constants/routes';
import { AppShell, AppHeader, ContentContainer } from '@/shared/ui';

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
    <AppShell
      className="bg-gradient-to-br from-background via-background to-primary/5"
      header={
        <AppHeader
          title={form.title}
          subtitle="🎲 The Lottery"
          backTo={ROUTES.getResponsesDashboardRoute(formId!)}
        />
      }
    >
      <div className="overflow-y-auto h-full">
        <ContentContainer maxWidth="6xl">
          <ConfettiCelebration trigger={showConfetti} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </ContentContainer>
      </div>
    </AppShell>
  );
};
