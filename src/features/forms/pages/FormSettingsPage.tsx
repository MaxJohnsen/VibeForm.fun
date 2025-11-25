import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Copy,
  ExternalLink,
  Download,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { formsApi } from '../api/formsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { SettingsCard } from '@/shared/ui/SettingsCard';
import { SettingsRow } from '@/shared/ui/SettingsRow';
import { StatusMenu } from '../components/StatusMenu';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import QRCode from 'react-qr-code';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/shared/utils/debounce';
import { validateSlug, formatSlug } from '@/shared/utils/slugValidation';

export const FormSettingsPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [questionCount, setQuestionCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || '');
      setSlug(form.slug || '');
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
    mutationFn: (data: { title?: string; description?: string; slug?: string | null }) =>
      formsApi.updateForm(formId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setSaveStatus('idle');
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

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((field: 'title' | 'description', value: string) => {
      setSaveStatus('saving');
      if (field === 'title' && value.trim()) {
        updateFormMutation.mutate({ title: value });
      } else if (field === 'description') {
        updateFormMutation.mutate({ description: value });
      }
    }, 1000),
    []
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (value.trim()) {
      debouncedSave('title', value);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    debouncedSave('description', value);
  };

  // Debounced slug availability check
  const checkSlugAvailability = useCallback(
    debounce(async (slugValue: string) => {
      if (!slugValue) {
        setSlugStatus('idle');
        return;
      }

      const validation = validateSlug(slugValue);
      if (!validation.valid) {
        setSlugError(validation.error || 'Invalid slug format');
        setSlugStatus('idle');
        return;
      }

      setSlugStatus('checking');
      setSlugError('');

      try {
        const isAvailable = await formsApi.checkSlugAvailability(slugValue, formId);
        if (isAvailable) {
          setSlugStatus('available');
          setSaveStatus('saving');
          updateFormMutation.mutate({ slug: slugValue });
        } else {
          setSlugStatus('taken');
          setSlugError('This slug is already taken');
        }
      } catch (error) {
        console.error('Error checking slug availability:', error);
        setSlugError('Failed to check availability');
        setSlugStatus('idle');
      }
    }, 800),
    [formId]
  );

  const handleSlugChange = (value: string) => {
    const formatted = formatSlug(value);
    setSlug(formatted);
    setSlugError('');
    
    if (!formatted) {
      setSlugStatus('idle');
      setSaveStatus('saving');
      updateFormMutation.mutate({ slug: null });
      return;
    }

    checkSlugAvailability(formatted);
  };

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'archived') => {
    await updateStatusMutation.mutateAsync(newStatus);
  };

  const handleCopyUrl = (isCustom: boolean = false) => {
    const identifier = isCustom && slug ? slug : formId!;
    const shareUrl = `${window.location.origin}${ROUTES.getRespondentRoute(identifier)}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied!',
      description: `${isCustom ? 'Custom' : 'Default'} URL copied to clipboard`,
    });
  };

  const handleOpenUrl = (isCustom: boolean = false) => {
    const identifier = isCustom && slug ? slug : formId!;
    window.open(ROUTES.getRespondentRoute(identifier), '_blank');
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTES.getBuilderRoute(formId!))}
              className="h-9 w-9 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-foreground truncate">
                {form.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Form Settings
                {saveStatus === 'saving' && ' · Saving...'}
                {saveStatus === 'saved' && ' · Saved'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Main Settings Card */}
          <SettingsCard>
            {/* Form Name */}
            <SettingsRow 
              label="Form Name"
              description="The title of your form"
            >
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter form name"
                className="h-11 text-base"
              />
            </SettingsRow>

            {/* Description */}
            <SettingsRow 
              label="Description"
              description="Help respondents understand your form"
              fullWidth
            >
              <Textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Add an optional description for your form..."
                className="min-h-[100px] resize-none text-base leading-relaxed"
              />
            </SettingsRow>

            {/* Status */}
            <SettingsRow 
              label="Status" 
              description={questionCount === 0 ? 'Add questions to activate your form' : 'Control who can access your form'}
            >
              <StatusMenu
                formId={formId!}
                currentStatus={form.status}
                questionCount={questionCount}
                onStatusChange={handleStatusChange}
              />
            </SettingsRow>

            {/* Custom Slug */}
            <SettingsRow 
              label="Custom Link"
              description="Create a memorable link (optional)"
              fullWidth
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-shrink-0 font-mono">
                    {window.location.origin}/f/
                  </span>
                  <div className="flex-1 relative">
                    <Input
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="my-custom-link"
                      className={`h-11 text-base font-mono pr-10 ${
                        slugError ? 'border-destructive' : 
                        slugStatus === 'available' ? 'border-green-500' : ''
                      }`}
                    />
                    {slugStatus === 'checking' && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {slugStatus === 'available' && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {slugStatus === 'taken' && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                
                {slugError && (
                  <div className="flex items-start gap-2 text-sm text-destructive animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{slugError}</span>
                  </div>
                )}
                
                {slugStatus === 'available' && slug && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 animate-fade-in">
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span>This slug is available!</span>
                  </div>
                )}

                {slug && slugStatus === 'available' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => handleCopyUrl(true)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy Custom Link
                    </Button>
                    <Button
                      onClick={() => handleOpenUrl(true)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Open Custom Link
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use lowercase letters, numbers, and hyphens (3-50 characters)
                </p>
              </div>
            </SettingsRow>

            {/* Default Form URL */}
            <SettingsRow 
              label="Default Link"
              description="Your form's permanent link"
            >
              <div className="flex gap-2 w-full">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-muted/30 text-sm font-mono h-11"
                />
                <Button
                  onClick={() => handleCopyUrl(false)}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0 h-11 w-11 hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleOpenUrl(false)}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0 h-11 w-11 hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </SettingsRow>

            {/* QR Code */}
            <SettingsRow 
              label="QR Code"
              description="Let people scan to open your form"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl flex-shrink-0 border-2 border-border/50 shadow-sm">
                  <QRCode
                    id="qr-code-svg"
                    value={shareUrl}
                    size={80}
                    level="H"
                  />
                </div>
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </SettingsRow>
          </SettingsCard>

          {/* Danger Zone Card */}
          <SettingsCard className="border-destructive/20 bg-destructive/[0.02]">
            <div className="py-5 px-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Form
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Permanently delete this form, all questions, and response data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                  size="sm"
                  className="flex-shrink-0 sm:mt-0.5"
                >
                  Delete Form
                </Button>
              </div>
            </div>
          </SettingsCard>
        </div>
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
