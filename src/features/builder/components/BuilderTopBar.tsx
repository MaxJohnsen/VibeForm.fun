import { ArrowLeft, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { Form } from '@/features/forms/api/formsApi';

interface BuilderTopBarProps {
  form: Form | null;
  isSaving?: boolean;
}

export const BuilderTopBar = ({ form, isSaving = false }: BuilderTopBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 border-b border-border/50 glass-panel flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.FORMS_HOME)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg">{form?.title || 'Untitled Form'}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${isSaving ? 'bg-muted-foreground animate-pulse' : 'bg-green-500'}`} />
            <span>{isSaving ? 'Saving...' : 'Saved'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};
