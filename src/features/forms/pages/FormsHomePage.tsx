import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { FormsList } from '../components/FormsList';
import { useForms } from '../hooks/useForms';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

export const FormsHomePage = () => {
  const navigate = useNavigate();
  const { forms, isLoading } = useForms();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">
                Create and manage your forms
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.CREATE_FORM)}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Create New Form
            </Button>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Search forms..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Forms Grid */}
        <FormsList
          forms={forms}
          isLoading={isLoading}
          onCreateNew={() => navigate(ROUTES.CREATE_FORM)}
        />
      </div>
    </div>
  );
};
