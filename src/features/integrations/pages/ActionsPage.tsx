import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { formsApi } from '@/features/forms/api/formsApi';
import { Button } from '@/components/ui/button';
import { ActionRow } from '../components/ActionRow';
import { AddIntegrationDialog } from '../components/AddIntegrationDialog';
import { IntegrationTypePalette } from '../components/IntegrationTypePalette';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { IntegrationType } from '../api/integrationsApi';
import { ROUTES } from '@/shared/constants/routes';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ActionsPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<IntegrationType | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<IntegrationType | 'all'>('all');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  
  const { integrations, isLoading } = useIntegrations(formId!);

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  // Filter actions based on search and type
  const filteredActions = integrations.filter((action) => {
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || action.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSelectType = (type: IntegrationType) => {
    setPreselectedType(type);
    setIsAddDialogOpen(true);
    setMobileSheetOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setPreselectedType(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Top Bar */}
      <div className="border-b border-border/50 glass-panel sticky top-0 z-10 backdrop-blur-xl bg-background/50">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -ml-2 md:ml-0"
                onClick={() => navigate(ROUTES.getBuilderRoute(formId!))}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-semibold truncate">
                  {form?.title || 'Form'}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
                  Actions • Automate workflows when responses are submitted
                </p>
              </div>
            </div>
            {isMobile && (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <IntegrationTypePalette onSelectType={handleSelectType} className="border-none h-full" />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {/* Split-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Desktop only */}
        {!isMobile && (
          <IntegrationTypePalette onSelectType={handleSelectType} />
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-panel p-4 rounded-lg animate-pulse">
                    <div className="h-12 bg-muted/50 rounded" />
                  </div>
                ))}
              </div>
            ) : integrations.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No actions yet"
                description="Choose an integration from the left to create your first action and automate your workflow."
                className="py-20"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Actions</h2>
                </div>

                {/* Search and filter bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <SearchBar
                      placeholder="Search actions..."
                      value={searchQuery}
                      onChange={setSearchQuery}
                      className="max-w-full"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as IntegrationType | 'all')}>
                    <SelectTrigger className="w-full sm:w-[180px] glass-panel">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {INTEGRATION_TYPES.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions list */}
                {filteredActions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No actions match your search
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActions.map((action) => (
                      <ActionRow key={action.id} action={action} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddIntegrationDialog
        formId={formId!}
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        preselectedType={preselectedType}
      />
    </div>
  );
};
