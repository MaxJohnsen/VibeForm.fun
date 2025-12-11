import { useState, useEffect } from 'react';
import { Eye, Share2, BarChart3, MoreVertical, Settings, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { Form, formsApi } from '@/features/forms/api/formsApi';
import { ShareDialog } from '@/features/forms/components/ShareDialog';
import { StatusMenu } from '@/features/forms/components/StatusMenu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppHeader } from '@/shared/ui/AppHeader';

interface BuilderTopBarProps {
  form: Form | null;
  isSaving?: boolean;
}

export const BuilderTopBar = ({ form, isSaving = false }: BuilderTopBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [questionCount, setQuestionCount] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

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


  // Mobile Actions (dropdown menu)
  const mobileActions = form && (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Form
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(ROUTES.getResponsesDashboardRoute(form.id))}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(ROUTES.getIntegrationsRoute(form.id))}>
            <Plug className="h-4 w-4 mr-2" />
            Connect
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(ROUTES.getFormSettingsRoute(form.id))}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Share</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShareOpen(true)} className="cursor-pointer">
            <Share2 className="h-4 w-4 mr-2" />
            Share Form
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <div className="px-2 py-1">
            <StatusMenu
              formId={form.id}
              currentStatus={form.status}
              questionCount={questionCount}
              onStatusChange={handleStatusChange}
            >
              <Button variant="outline" size="sm" className="w-full justify-start">
                Status: <span className="capitalize ml-1">{form.status}</span>
              </Button>
            </StatusMenu>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareDialog
        formId={form.id}
        formTitle={form.title}
        formStatus={form.status}
        formSlug={form.slug}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );

  // Desktop Actions
  const desktopActions = form && (
    <>
      <StatusMenu
        formId={form.id}
        currentStatus={form.status}
        questionCount={questionCount}
        onStatusChange={handleStatusChange}
      />
      <Separator orientation="vertical" className="h-6" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(ROUTES.getResponsesDashboardRoute(form.id))}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(ROUTES.getIntegrationsRoute(form.id))}
      >
        <Plug className="h-4 w-4 mr-2" />
        Connect
      </Button>
      <Button variant="outline" size="sm" onClick={handlePreview}>
        <Eye className="h-4 w-4 mr-2" />
        Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(ROUTES.getFormSettingsRoute(form.id))}
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
      <Button size="sm" onClick={() => setShareOpen(true)}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <ShareDialog
        formId={form.id}
        formTitle={form.title}
        formStatus={form.status}
        formSlug={form.slug}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );

  return (
    <AppHeader
      title={form?.title || 'Untitled Form'}
      backTo={ROUTES.FORMS_HOME}
      saveStatus={isSaving ? 'saving' : 'saved'}
      actions={isMobile ? mobileActions : desktopActions}
    />
  );
};
