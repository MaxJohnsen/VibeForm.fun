import { useState, useEffect } from 'react';
import { Clock, MessageSquare, Share2, MoreHorizontal, Trash2, Eye, ExternalLink, CheckCircle, FileEdit, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
import { GlassCard } from '@/shared/ui/GlassCard';
import { Form, formsApi } from '../api/formsApi';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SharePopover } from './SharePopover';
import { supabase } from '@/integrations/supabase/client';

interface FormCardProps {
  form: Form;
}

export const FormCard = ({ form }: FormCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const fetchQuestionCount = async () => {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', form.id);
      setQuestionCount(count || 0);
    };
    fetchQuestionCount();
  }, [form.id]);

  const deleteFormMutation = useMutation({
    mutationFn: () => formsApi.deleteForm(form.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: 'Form deleted',
        description: 'The form has been deleted successfully.',
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
      formsApi.updateForm(form.id, { status: newStatus }),
    onSuccess: () => {
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

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'archived') => {
    await updateStatusMutation.mutateAsync(newStatus);
  };

  const handlePreview = () => {
    window.open(ROUTES.getRespondentRoute(form.id), '_blank');
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
    <>
      <GlassCard className="p-6 hover-elevate transition-all duration-300 relative">
        {/* Form Title and Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-bold text-lg flex-1">{form.title}</h3>
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
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Form
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border z-50">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview();
                }}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Form
              </DropdownMenuItem>
              
              <SharePopover
                formId={form.id}
                formTitle={form.title}
                formStatus={form.status}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Form
                </DropdownMenuItem>
              </SharePopover>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
              
              {form.status !== 'active' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('active');
                  }}
                  disabled={questionCount === 0}
                  className="cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-foreground">Activate Form</span>
                </DropdownMenuItem>
              )}
              
              {form.status !== 'draft' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('draft');
                  }}
                  className="cursor-pointer"
                >
                  <FileEdit className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-foreground">Move to Draft</span>
                </DropdownMenuItem>
              )}
              
              {form.status !== 'archived' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('archived');
                  }}
                  className="cursor-pointer"
                >
                  <Archive className="h-4 w-4 mr-2 text-orange-600" />
                  <span className="text-foreground">Archive Form</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }} 
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GlassCard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{form.title}" and all its questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteFormMutation.mutate();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
