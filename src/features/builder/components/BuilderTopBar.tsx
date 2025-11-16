import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/lib/utils';

interface BuilderTopBarProps {
  formTitle: string;
  onUpdateTitle: (title: string) => void;
  isSaving?: boolean;
}

export const BuilderTopBar = ({ 
  formTitle, 
  onUpdateTitle,
  isSaving = false
}: BuilderTopBarProps) => {
  const navigate = useNavigate();
  const [localTitle, setLocalTitle] = useState(formTitle);

  useEffect(() => {
    setLocalTitle(formTitle);
  }, [formTitle]);

  const handleBlur = () => {
    if (localTitle.trim() && localTitle !== formTitle) {
      onUpdateTitle(localTitle);
    }
  };

  return (
    <div className="glass-panel border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.HOME)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleBlur}
            className="flex-1 bg-transparent border-none outline-none text-lg font-semibold text-foreground placeholder:text-muted-foreground min-w-0"
            placeholder="Untitled Form"
          />

          <div className={cn(
            'text-xs transition-opacity duration-200',
            isSaving ? 'text-muted-foreground' : 'text-muted-foreground/60'
          )}>
            {isSaving ? 'Saving...' : 'Saved'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};
