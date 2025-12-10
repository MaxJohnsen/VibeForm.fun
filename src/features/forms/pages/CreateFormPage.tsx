import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/shared/ui/TextInput';
import { GlassCard } from '@/shared/ui/GlassCard';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { useForms } from '../hooks/useForms';
import { ROUTES } from '@/shared/constants/routes';
import { SupportedLanguage } from '@/shared/constants/translations';
import { Label } from '@/components/ui/label';

export const CreateFormPage = () => {
  const navigate = useNavigate();
  const { createForm, activeWorkspaceId } = useForms();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeWorkspaceId) return;

    setIsSubmitting(true);
    try {
      const form = await createForm({
        title: title.trim(),
        description: description.trim() || undefined,
        language,
        workspace_id: activeWorkspaceId,
      });
      navigate(ROUTES.getBuilderRoute(form.id));
    } catch (error) {
      console.error('Failed to create form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.FORMS_HOME)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Button>

        <GlassCard padding="lg">
          <h1 className="text-3xl font-bold mb-3">Create New Form</h1>
          <p className="text-muted-foreground mb-8">
            Give your form a name to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Form Name"
              placeholder="My Awesome Form"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <TextInput
              label="Internal Description (Optional)"
              placeholder="Internal notes about this form (not shown to respondents)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="space-y-2">
              <Label htmlFor="form-language">Form Language</Label>
              <LanguageSelector
                value={language}
                onChange={setLanguage}
              />
              <p className="text-xs text-muted-foreground">
                Language for buttons, navigation, and system messages
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.FORMS_HOME)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting || !activeWorkspaceId}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create Form'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
