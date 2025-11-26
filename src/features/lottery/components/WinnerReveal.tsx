import { useEffect, useState } from 'react';
import { generatePersona, getInitialsFromName } from '@/shared/utils/personaGenerator';

interface Candidate {
  sessionToken: string;
  name?: string;
}

interface WinnerRevealProps {
  candidates: Candidate[];
  winners: Candidate[];
  isAnimating: boolean;
  onComplete: () => void;
}

export const WinnerReveal = ({ candidates, winners, isAnimating, onComplete }: WinnerRevealProps) => {
  const [currentIndices, setCurrentIndices] = useState<number[]>(winners.map(() => 0));
  const [phase, setPhase] = useState<'fast' | 'slow' | 'reveal'>('fast');

  useEffect(() => {
    if (!isAnimating) return;

    let interval: NodeJS.Timeout;
    let phaseTimeout: NodeJS.Timeout;
    let startTime = Date.now();

    const updateIndices = () => {
      setCurrentIndices(prev => 
        prev.map(() => Math.floor(Math.random() * candidates.length))
      );
    };

    // Fast rolling phase (1.5s)
    setPhase('fast');
    interval = setInterval(updateIndices, 50);

    phaseTimeout = setTimeout(() => {
      clearInterval(interval);
      
      // Slow down phase (1.5s)
      setPhase('slow');
      let slowInterval = 100;
      
      const slowRoll = () => {
        updateIndices();
        slowInterval += 50;
        
        if (Date.now() - startTime < 3000) {
          setTimeout(slowRoll, slowInterval);
        } else {
          // Final reveal
          setPhase('reveal');
          setCurrentIndices(winners.map((_, idx) => idx));
          setTimeout(onComplete, 800);
        }
      };
      
      slowRoll();
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimeout);
    };
  }, [isAnimating, candidates.length, winners.length, onComplete]);

  const getDisplayCandidate = (slotIndex: number) => {
    if (phase === 'reveal') {
      return winners[slotIndex];
    }
    const candidate = candidates[currentIndices[slotIndex]];
    return candidate || candidates[0];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground text-center animate-pulse">
        🎲 Drawing {winners.length === 1 ? 'Winner' : 'Winners'}...
      </h2>
      
      <div className="grid gap-4">
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
                glass-panel rounded-2xl p-8 
                transition-all duration-300
                ${phase === 'fast' ? 'blur-[2px]' : ''}
                ${phase === 'reveal' ? 'animate-scale-in ring-2 ring-primary/50 shadow-glow' : ''}
              `}
            >
              <div className="flex flex-col items-center space-y-4">
                {winners.length > 1 && (
                  <div className="text-sm font-medium text-muted-foreground">
                    Winner #{slotIndex + 1}
                  </div>
                )}

                {/* Avatar */}
                <div 
                  className={`
                    w-20 h-20 rounded-full ${persona.avatarColor} 
                    flex items-center justify-center
                    transition-transform duration-200
                    ${phase === 'fast' ? 'scale-95' : 'scale-100'}
                  `}
                >
                  <span className="text-2xl font-bold text-white">
                    {initials}
                  </span>
                </div>

                {/* Name */}
                <div className="text-center">
                  <h3 
                    className={`
                      text-2xl font-bold text-foreground
                      transition-all duration-200
                      ${phase === 'reveal' ? 'text-primary' : ''}
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
  );
};
