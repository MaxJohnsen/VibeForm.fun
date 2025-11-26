import { Winner } from '../api/lotteryApi';
import { generatePersona } from '@/shared/utils/personaGenerator';
import { Trophy } from 'lucide-react';

interface WinnerCardProps {
  winner: Winner;
  index: number;
  total: number;
}

export const WinnerCard = ({ winner, index, total }: WinnerCardProps) => {
  const persona = generatePersona(winner.sessionToken);
  // Only use winner.name if it's a valid string (not {_skipped: true})
  const displayName = (typeof winner.name === 'string' && winner.name.trim()) 
    ? winner.name 
    : persona.name;
  const isAnonymous = !(typeof winner.name === 'string' && winner.name.trim());

  return (
    <div 
      className="glass-panel rounded-2xl p-8 animate-scale-in"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Trophy Icon */}
        {total === 1 && (
          <Trophy className="w-12 h-12 text-yellow-500" />
        )}
        
        {/* Position Badge */}
        {total > 1 && (
          <div className="text-sm font-medium text-muted-foreground">
            Winner #{index + 1}
          </div>
        )}

        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full ${persona.avatarColor} flex items-center justify-center`}>
          <span className="text-2xl font-bold text-white">
            {persona.initials}
          </span>
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">
            {displayName}
          </h3>
          {isAnonymous && (
            <p className="text-sm text-muted-foreground mt-1">
              Anonymous Response
            </p>
          )}
        </div>

        {/* Session ID (subtle) */}
        <p className="text-xs text-muted-foreground/60 font-mono">
          {winner.sessionToken.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
};
