import { useState, useMemo } from 'react';
import { Plus, ChevronsUpDown, Building2, Check, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar, AppSidebar, PageContainer, ContentContainer } from '@/shared/ui';
import { FormsList } from '../components/FormsList';
import { StatusFilterTabs } from '../components/StatusFilterTabs';
import { ActivityFeed } from '../components/ActivityFeed';
import { useForms } from '../hooks/useForms';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useWorkspaceContext, CreateWorkspaceDialog, workspacesApi } from '@/features/workspaces';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterType = 'all' | 'active' | 'draft' | 'archived';
type SortType = 'updated' | 'created' | 'title';

export const FormsHomePage = () => {
  const navigate = useNavigate();
  const { forms, isLoading } = useForms();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('created');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch workspace members to get email addresses
  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', activeWorkspace?.id],
    queryFn: () => workspacesApi.getWorkspaceMembers(activeWorkspace!.id),
    enabled: !!activeWorkspace?.id,
  });

  // Create userId -> email lookup map
  const memberEmailMap = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach(m => {
      if (m.email) map[m.user_id] = m.email;
    });
    return map;
  }, [members]);

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
    <PageContainer>
      <AppSidebar />

      <div className="ml-0 md:ml-16 pb-24 md:pb-0">
        <ContentContainer maxWidth="7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-end gap-3">
              <h1>{activeWorkspace?.name || 'Your Projects'}</h1>
              {workspaces.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1.5 text-muted-foreground h-8 px-2 mb-0.5"
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="hidden md:inline text-sm">Change workspace</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Workspaces
                    </div>
                    {workspaces.map((workspace) => (
                      <DropdownMenuItem
                        key={workspace.id}
                        onClick={() => setActiveWorkspace(workspace)}
                        className="cursor-pointer"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mr-2">
                          <Building2 className="h-3 w-3" />
                        </div>
                        <span className="truncate flex-1">{workspace.name}</span>
                        {workspace.id === activeWorkspace?.id && (
                          <Check className="h-4 w-4 text-primary ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setCreateDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
        </div>

        {/* 3-Column Layout */}
        <div className="flex gap-8">
          {/* Left Sidebar: Status Filters (hidden on mobile) */}
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-8">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Filter
              </h2>
              <StatusFilterTabs 
                forms={forms}
                activeFilter={filterType}
                onFilterChange={setFilterType}
              />
            </div>
          </aside>

          {/* Center: Form Cards */}
          <main className="flex-1 min-w-0">
            {/* Search and Sort Row */}
            <div className="flex items-center gap-3 mb-6">
              <SearchBar
                placeholder="Search forms..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="max-w-none"
              />
              
              {/* Mobile Filter */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      {filterType === 'all' ? 'All' : filterType}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType('all')}>All Forms</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('active')}>Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('draft')}>Draft</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('archived')}>Archived</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <ArrowUpDown className="h-4 w-4" />
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

            {/* Forms List */}
            <FormsList
              forms={filteredAndSortedForms}
              isLoading={isLoading}
              memberEmailMap={memberEmailMap}
            />
          </main>

          {/* Right Sidebar: Activity Feed (hidden on mobile/tablet) */}
          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-8">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Activity
              </h2>
              <ActivityFeed workspaceId={activeWorkspace?.id} />
            </div>
          </aside>
        </div>
        </ContentContainer>
      </div>

      <CreateWorkspaceDialog
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </PageContainer>
  );
};
