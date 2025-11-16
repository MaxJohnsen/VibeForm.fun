import { FileText, Clock, MessageSquare, Share2, MoreHorizontal, Pencil } from 'lucide-react';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'archived':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <GlassCard className="p-6 hover-elevate transition-all duration-300 relative">
      {/* Form Title and Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-lg flex-1">{form.title}</h3>
        <Badge className={`${getStatusColor(form.status)} capitalize rounded-full px-3 py-1 text-xs font-medium border flex-shrink-0`}>
          {form.status}
        </Badge>
      </div>

      {/* Description */}
      {form.description && (
        <p className="text-sm text-muted-foreground mb-4">{form.description}</p>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>234 responses</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate(ROUTES.getBuilderRoute(form.id))}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  );
};
