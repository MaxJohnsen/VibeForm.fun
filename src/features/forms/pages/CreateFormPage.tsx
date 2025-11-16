import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, TextInput } from '@/shared/ui';
import { useCreateForm } from '../hooks/useForms';
import { ROUTES } from '@/shared/constants/routes';

export const CreateFormPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const createForm = useCreateForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const form = await createForm.mutateAsync(title);
      navigate(ROUTES.BUILDER(form.id));
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.HOME)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forms
        </Button>

        <GlassCard>
          <h1 className="text-2xl font-semibold text-foreground mb-6">
            Create New Form
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Form Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Customer Feedback Survey"
              autoFocus
              required
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.HOME)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!title.trim() || createForm.isPending}
              >
                {createForm.isPending ? 'Creating...' : 'Create Form'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
