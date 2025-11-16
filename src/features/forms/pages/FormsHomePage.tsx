import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForms } from '../hooks/useForms';
import { FormsList } from '../components/FormsList';
import { SearchBar } from '../components/SearchBar';
import { EmptyState, LoadingSpinner } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

export const FormsHomePage = () => {
  const navigate = useNavigate();
  const { data: forms, isLoading } = useForms();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredForms = forms?.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            My Forms
          </h1>
          <p className="text-muted-foreground">
            Create and manage your conversational forms
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <Button
            onClick={() => navigate(ROUTES.FORMS_NEW)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </Button>
        </div>

        {/* Forms List */}
        {filteredForms.length > 0 ? (
          <FormsList forms={filteredForms} />
        ) : forms && forms.length > 0 ? (
          <EmptyState
            icon={<FileText className="w-16 h-16" />}
            title="No forms found"
            description={`No forms match "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon={<FileText className="w-16 h-16" />}
            title="No forms yet"
            description="Create your first form to get started"
            action={
              <Button onClick={() => navigate(ROUTES.FORMS_NEW)} className="gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Form
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};
