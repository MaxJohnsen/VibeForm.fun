import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '../api/formsApi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

interface FormCardProps {
  form: Form;
}

export const FormCard = ({ form }: FormCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-panel rounded-xl p-6 hover-elevate transition-all duration-300 animate-fade-in">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
          {form.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4" />
          <span>
            Updated {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-auto">
          <Button
            onClick={() => navigate(ROUTES.BUILDER(form.id))}
            className="w-full"
            variant="outline"
          >
            Open Builder
          </Button>
        </div>
      </div>
    </div>
  );
};
