import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  ToggleLeft,
  Share2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { formsApi } from '../api/formsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SettingsSection } from '@/shared/ui/SettingsSection';
import { StatusMenu } from '../components/StatusMenu';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import QRCode from 'react-qr-code';
import { supabase } from '@/integrations/supabase/client';

export const FormSettingsPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || '');
    }
  }, [form]);

  useEffect(() => {
    if (!formId) return;
    const fetchQuestionCount = async () => {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId);
      setQuestionCount(count || 0);
    };
    fetchQuestionCount();
  }, [formId]);

  const updateFormMutation = useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      formsApi.updateForm(formId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: 'Success',
        description: 'Form updated successfully',
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

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: 'draft' | 'active' | 'archived') =>
      formsApi.updateForm(formId!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      queryClient.invalidateQueries({ queryKey: ['forms'] });
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

  const deleteFormMutation = useMutation({
    mutationFn: () => formsApi.deleteForm(formId!),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
      navigate(ROUTES.FORMS_HOME);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSaveTitle = () => {
    if (title !== form?.title) {
      updateFormMutation.mutate({ title });
    }
  };

  const handleSaveDescription = () => {
    if (description !== form?.description) {
      updateFormMutation.mutate({ description });
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'archived') => {
    await updateStatusMutation.mutateAsync(newStatus);
  };

  const handleCopyUrl = () => {
    const shareUrl = `${window.location.origin}${ROUTES.getRespondentRoute(formId!)}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied!',
      description: 'Form URL copied to clipboard',
    });
  };

  const handleOpenUrl = () => {
    window.open(ROUTES.getRespondentRoute(formId!), '_blank');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx!.fillStyle = 'white';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0, 1024, 1024);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob!);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form?.title || 'form'}-qr-code.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}${ROUTES.getRespondentRoute(formId!)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.FORMS_HOME)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Form Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your form configuration
            </p>
          </div>
        </div>

        {/* General Section */}
        <SettingsSection
          icon={FileText}
          title="General"
          description="Basic information about your form"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Name</Label>
              <div className="flex gap-2">
                <Input
                  id="form-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter form name"
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveTitle}
                  disabled={title === form.title || !title.trim()}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description (Optional)</Label>
              <div className="flex gap-2">
                <Textarea
                  id="form-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description..."
                  rows={3}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveDescription}
                  disabled={description === (form.description || '')}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Status Section */}
        <SettingsSection
          icon={ToggleLeft}
          title="Status"
          description="Control form availability"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Current Status:
              </span>
              <StatusMenu
                formId={formId!}
                currentStatus={form.status}
                questionCount={questionCount}
                onStatusChange={handleStatusChange}
              />
            </div>
            {questionCount === 0 && (
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500">ℹ️</span>
                Forms must have at least one question to activate
              </p>
            )}
          </div>
        </SettingsSection>

        {/* Sharing Section */}
        <SettingsSection
          icon={Share2}
          title="Sharing"
          description="Share your form with respondents"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Form URL</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleCopyUrl} variant="outline">
                  Copy
                </Button>
                <Button onClick={handleOpenUrl} variant="outline">
                  Open
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>QR Code</Label>
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-xl border">
                  <QRCode
                    id="qr-code-svg"
                    value={shareUrl}
                    size={120}
                    level="H"
                  />
                </div>
                <Button onClick={handleDownloadQR} variant="outline">
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection
          icon={Trash2}
          title="Danger Zone"
          description="Irreversible actions"
          variant="danger"
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This will permanently delete the form and all responses. This
              action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Form
            </Button>
          </div>
        </SettingsSection>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{form.title}" and all its questions
              and responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFormMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
