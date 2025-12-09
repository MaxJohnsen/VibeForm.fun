import { useState, useMemo } from 'react';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { AppSidebar } from '@/shared/ui/AppSidebar';
import { FormsList } from '../components/FormsList';
import { useForms } from '../hooks/useForms';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useWorkspaceContext } from '@/features/workspaces';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterType = 'all' | 'active' | 'draft' | 'archived';
type SortType = 'updated' | 'created' | 'title';

export const FormsHomePage = () => {
  const navigate = useNavigate();
  const { forms, isLoading } = useForms();
  const { activeWorkspace } = useWorkspaceContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('updated');

  const filteredAndSortedForms = useMemo(() => {
    let filtered = forms;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (form) =>
          form.title.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterType !== 'all') {
      filtered = filtered.filter((form) => form.status === filterType);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return sorted;
  }, [forms, searchQuery, filterType, sortType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppSidebar />

      <div className="ml-0 md:ml-16 px-4 md:px-8 py-4 md:py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                {activeWorkspace?.name || 'Your Projects'}
              </h1>
              <p className="text-muted-foreground hidden md:block">
                Your free & open source form builder
              </p>
            </div>
            <Button
              size="default"
              onClick={() => navigate(ROUTES.CREATE_FORM)}
              className="gap-2 rounded-full px-4 md:px-6"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Create New Form</span>
              <span className="md:hidden">New</span>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1">
              <SearchBar
                placeholder="Search your forms..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-2 md:contents">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="gap-2 md:w-auto md:px-4 shrink-0">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">Filter</span>
                    {filterType !== 'all' && (
                      <span className="hidden md:inline ml-1 text-xs text-muted-foreground">
                        ({filterType})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    All Forms
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('draft')}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('archived')}>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="gap-2 md:w-auto md:px-4 shrink-0">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden md:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortType('updated')}>
                    Last Updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('created')}>
                    Date Created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortType('title')}>
                    Title (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <FormsList
          forms={filteredAndSortedForms}
          isLoading={isLoading}
          onCreateNew={() => navigate(ROUTES.CREATE_FORM)}
        />
      </div>
    </div >
  );
};
