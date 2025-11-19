import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Share2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { Form, formsApi } from '@/features/forms/api/formsApi';
import { SharePopover } from '@/features/forms/components/SharePopover';
import { StatusMenu } from '@/features/forms/components/StatusMenu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BuilderTopBarProps {
  form: Form | null;
  isSaving?: boolean;
}

export const BuilderTopBar = ({ form, isSaving = false }: BuilderTopBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (!form) return;
    const fetchQuestionCount = async () => {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', form.id);
      setQuestionCount(count || 0);
    };
    fetchQuestionCount();
  }, [form?.id]);

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: 'draft' | 'active' | 'archived') =>
      formsApi.updateForm(form!.id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', form?.id] });
      toast({
        title: 'Status updated',
        description: 'Form status has been changed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'archived') => {
    await updateStatusMutation.mutateAsync(newStatus);
  };

  const handlePreview = () => {
    if (form) {
      window.open(ROUTES.getRespondentRoute(form.id), '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'draft':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'archived':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

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
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-lg">{form?.title || 'Untitled Form'}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${isSaving ? 'bg-muted-foreground animate-pulse' : 'bg-green-500'}`} />
              <span>{isSaving ? 'Saving...' : 'Saved'}</span>
            </div>
          </div>
          {form && (
            <Badge className={`${getStatusColor(form.status)} capitalize rounded-full px-3 py-1 text-xs font-medium border`}>
              {form.status}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {form && (
          <>
            <StatusMenu
              formId={form.id}
              currentStatus={form.status}
              questionCount={questionCount}
              onStatusChange={handleStatusChange}
            />
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(ROUTES.getResponsesDashboardRoute(form?.id || ''))}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        {form && (
          <SharePopover
            formId={form.id}
            formTitle={form.title}
            formStatus={form.status}
          >
            <Button size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </SharePopover>
        )}
      </div>
    </div>
  );
};
