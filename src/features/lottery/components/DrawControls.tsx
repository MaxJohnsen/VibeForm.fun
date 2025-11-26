import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles, Users } from 'lucide-react';
import { lotteryApi } from '../api/lotteryApi';

interface DrawControlsProps {
  formId: string;
  hasNameQuestion: boolean;
  onDraw: (winnerCount: number, namedOnly: boolean) => void;
  isDrawing: boolean;
}

export const DrawControls = ({ formId, hasNameQuestion, onDraw, isDrawing }: DrawControlsProps) => {
  const [winnerCount, setWinnerCount] = useState(1);
  const [namedOnly, setNamedOnly] = useState(false);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  useEffect(() => {
    const fetchEligibleCount = async () => {
      setIsLoadingCount(true);
      try {
        const count = await lotteryApi.getEligibleCount(formId, namedOnly);
        setEligibleCount(count);
        
        // Adjust winner count if it exceeds eligible count
        if (winnerCount > count) {
          setWinnerCount(Math.max(1, count));
        }
      } catch (error) {
        console.error('Failed to fetch eligible count:', error);
        setEligibleCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchEligibleCount();
  }, [formId, namedOnly]);

  const handleDraw = () => {
    if (eligibleCount === 0) return;
    onDraw(winnerCount, namedOnly);
  };

  const maxWinners = Math.min(10, eligibleCount);

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Draw Settings</h2>

      {/* Winner Count Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Number of Winners</Label>
          <span className="text-2xl font-bold text-primary">{winnerCount}</span>
        </div>
        <Slider
          value={[winnerCount]}
          onValueChange={(value) => setWinnerCount(value[0])}
          min={1}
          max={maxWinners}
          step={1}
          disabled={isDrawing || isLoadingCount || eligibleCount === 0}
          className="w-full"
        />
      </div>

      {/* Named Only Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
        <div className="space-y-1">
          <Label className="text-base cursor-pointer">Named Responses Only</Label>
          <p className="text-sm text-muted-foreground">
            Only include responses with a name
          </p>
        </div>
        <Switch
          checked={namedOnly}
          onCheckedChange={setNamedOnly}
          disabled={!hasNameQuestion || isDrawing || isLoadingCount}
        />
      </div>

      {!hasNameQuestion && (
        <p className="text-sm text-muted-foreground italic">
          No name question found in this form
        </p>
      )}

      {/* Eligible Pool Indicator */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Eligible Pool</span>
        </div>
        <span className="text-lg font-bold text-primary">
          {isLoadingCount ? '...' : eligibleCount}
        </span>
      </div>

      {/* Draw Button */}
      <Button
        onClick={handleDraw}
        disabled={isDrawing || isLoadingCount || eligibleCount === 0}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        size="lg"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        {isDrawing ? 'Drawing Winners...' : 'Draw Winners'}
      </Button>

      {eligibleCount === 0 && !isLoadingCount && (
        <p className="text-sm text-destructive text-center">
          No eligible responses found
        </p>
      )}
    </div>
  );
};
