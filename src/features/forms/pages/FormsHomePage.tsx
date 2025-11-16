import { useState } from 'react';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { AppSidebar } from '@/shared/ui/AppSidebar';
import { FormsList } from '../components/FormsList';
import { StatsPanel } from '../components/StatsPanel';
import { useForms } from '../hooks/useForms';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

export const FormsHomePage = () => {
  const navigate = useNavigate();
  const { forms, isLoading } = useForms();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppSidebar />
      
      <div className="ml-16 px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">
                Create beautiful conversational forms
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.CREATE_FORM)}
              className="gap-2 rounded-full px-6"
            >
              <Plus className="h-5 w-5" />
              Create New Form
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                placeholder="Search your forms..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        {/* Forms Grid */}
        <FormsList
          forms={forms}
          isLoading={isLoading}
          onCreateNew={() => navigate(ROUTES.CREATE_FORM)}
        />

        {/* Stats Panel */}
        <StatsPanel />
      </div>
    </div>
  );
};
