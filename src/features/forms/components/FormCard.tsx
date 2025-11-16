import { FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Form } from '../api/formsApi';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

interface FormCardProps {
  form: Form;
}

export const FormCard = ({ form }: FormCardProps) => {
  const navigate = useNavigate();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <GlassCard className="p-6 hover-elevate cursor-pointer transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-3">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{form.title}</h3>
            {form.description && (
              <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
            )}
          </div>
        </div>
        <Badge variant={getStatusVariant(form.status)}>
          {form.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Updated {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}</span>
        </div>

        <Button
          onClick={() => navigate(ROUTES.getBuilderRoute(form.id))}
          variant="default"
        >
          Open Builder
        </Button>
      </div>
    </GlassCard>
  );
};
