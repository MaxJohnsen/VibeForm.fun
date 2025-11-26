import { useEffect, useState } from 'react';
import { Sparkles, Trophy, Loader2 } from 'lucide-react';
import { Winner } from '../api/lotteryApi';
import { generatePersona, getInitialsFromName } from '@/shared/utils/personaGenerator';

interface WinnerDisplayCardProps {
  state: 'idle' | 'loading' | 'animating' | 'revealed';
  candidates: Winner[];
  winners: Winner[];
  onAnimationComplete: () => void;
}

export const WinnerDisplayCard = ({ 
  state, 
  candidates, 
  winners, 
  onAnimationComplete 
}: WinnerDisplayCardProps) => {
  const [currentIndices, setCurrentIndices] = useState<number[]>([]);
  const [animPhase, setAnimPhase] = useState<'fast' | 'slow' | 'reveal'>('fast');

  // Animation effect
  useEffect(() => {
    if (state !== 'animating' || candidates.length === 0 || winners.length === 0) return;

    setCurrentIndices(winners.map(() => 0));
    setAnimPhase('fast');

    let interval: NodeJS.Timeout;
    let phaseTimeout: NodeJS.Timeout;
    const startTime = Date.now();

    const updateIndices = () => {
      setCurrentIndices(prev => 
        prev.map(() => Math.floor(Math.random() * candidates.length))
      );
    };

    // Fast rolling phase (1.5s)
    interval = setInterval(updateIndices, 50);

    phaseTimeout = setTimeout(() => {
      clearInterval(interval);
      
      // Slow down phase (1.5s)
      setAnimPhase('slow');
      let slowInterval = 100;
      
      const slowRoll = () => {
        updateIndices();
        slowInterval += 50;
        
        if (Date.now() - startTime < 3000) {
          setTimeout(slowRoll, slowInterval);
        } else {
          // Final reveal
          setAnimPhase('reveal');
          setCurrentIndices(winners.map((_, idx) => idx));
          setTimeout(onAnimationComplete, 800);
        }
      };
      
      slowRoll();
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimeout);
    };
  }, [state, candidates.length, winners.length, onAnimationComplete]);

  const getDisplayCandidate = (slotIndex: number) => {
    if (animPhase === 'reveal') {
      return winners[slotIndex];
    }
    const candidate = candidates[currentIndices[slotIndex]];
    return candidate || candidates[0];
  };

  return (
    <div className="glass-panel rounded-2xl p-8 pt-16 h-full min-h-[400px] flex flex-col items-center justify-start">
      {/* Idle State */}
      {state === 'idle' && (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Sparkles className="w-16 h-16 text-primary/40" />
          <h3 className="text-xl font-semibold text-muted-foreground">
            Draw your first winner!
          </h3>
          <p className="text-sm text-muted-foreground/60">
            Configure settings and click "Draw Winners" to begin
          </p>
        </div>
      )}

      {/* Loading State */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h3 className="text-xl font-semibold text-foreground">
            Preparing draw...
          </h3>
          <p className="text-sm text-muted-foreground/60">
            Loading eligible participants
          </p>
        </div>
      )}

      {/* Animating State */}
      {state === 'animating' && candidates.length > 0 && winners.length > 0 && (
        <div className="w-full space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground animate-pulse">
              🎲 Drawing {winners.length === 1 ? 'Winner' : 'Winners'}...
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {winners.map((_, slotIndex) => {
              const candidate = getDisplayCandidate(slotIndex);
              const persona = generatePersona(candidate.sessionToken);
              const displayName = (typeof candidate.name === 'string' && candidate.name.trim())
                ? candidate.name
                : `Anonymous (${candidate.sessionToken.slice(0, 6)})`;
              const isAnonymous = !(typeof candidate.name === 'string' && candidate.name.trim());
              const initials = isAnonymous ? 'AN' : getInitialsFromName(candidate.name as string);

              return (
                <div
                  key={slotIndex}
                  className={`
                    transition-all duration-300
                    ${animPhase === 'fast' ? 'blur-[2px]' : ''}
                    ${animPhase === 'reveal' ? 'animate-scale-in' : ''}
                  `}
                >
                  <div className="flex flex-col items-center space-y-3">
                    {winners.length > 1 && (
                      <div className="text-sm font-medium text-muted-foreground">
                        #{slotIndex + 1}
                      </div>
                    )}

                    {/* Avatar */}
                    <div 
                      className={`
                        ${winners.length === 1 ? 'w-20 h-20' : 'w-16 h-16'} 
                        rounded-full ${persona.avatarColor} 
                        flex items-center justify-center
                        transition-transform duration-200
                        ${animPhase === 'fast' ? 'scale-95' : 'scale-100'}
                      `}
                    >
                      <span className={`${winners.length === 1 ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
                        {initials}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="text-center">
                      <h3 
                        className={`
                          ${winners.length === 1 ? 'text-2xl' : 'text-lg'} 
                          font-bold text-foreground
                          transition-all duration-200
                          ${animPhase === 'reveal' ? 'text-primary' : ''}
                        `}
                      >
                        {displayName}
                      </h3>
                    </div>

                    {/* Session ID */}
                    <p className="text-xs text-muted-foreground/60 font-mono">
                      {candidate.sessionToken.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revealed State */}
      {state === 'revealed' && winners.length > 0 && (
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            🎉 {winners.length === 1 ? 'Winner' : 'Winners'}!
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {winners.map((winner, index) => {
              const persona = generatePersona(winner.sessionToken);
              const displayName = (typeof winner.name === 'string' && winner.name.trim()) 
                ? winner.name 
                : `Anonymous (${winner.sessionToken.slice(0, 6)})`;
              const isAnonymous = !(typeof winner.name === 'string' && winner.name.trim());

              return (
                <div 
                  key={winner.responseId}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex flex-col items-center space-y-3">
                    {/* Trophy Icon */}
                    {winners.length === 1 && (
                      <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                    )}
                    
                    {/* Position Badge */}
                    {winners.length > 1 && (
                      <div className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                    )}

                    {/* Avatar */}
                    <div className={`${winners.length === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full ${persona.avatarColor} flex items-center justify-center`}>
                      <span className={`${winners.length === 1 ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
                        {isAnonymous ? 'AN' : persona.initials}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="text-center">
                      <h3 className={`${winners.length === 1 ? 'text-2xl' : 'text-lg'} font-bold text-foreground`}>
                        {displayName}
                      </h3>
                    </div>

                    {/* Session ID (subtle) */}
                    <p className="text-xs text-muted-foreground/60 font-mono">
                      {winner.sessionToken.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
