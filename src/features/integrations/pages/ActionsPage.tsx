import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { formsApi } from '@/features/forms/api/formsApi';
import { Button } from '@/components/ui/button';
import { ActionRow } from '../components/ActionRow';
import { AddIntegrationDialog } from '../components/AddIntegrationDialog';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { IntegrationType } from '../api/integrationsApi';
import { ROUTES } from '@/shared/constants/routes';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState } from '@/shared/ui/EmptyState';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<IntegrationType | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<IntegrationType | 'all'>('all');
  
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

  const handleSetupAction = (type?: IntegrationType) => {
    setPreselectedType(type);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setPreselectedType(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Top Bar */}
      <div className="border-b border-border/50 glass-panel sticky top-0 z-10 backdrop-blur-xl bg-background/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
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
            <Button 
              onClick={() => handleSetupAction()} 
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Action</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Search and Filter Bar */}
        {integrations.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
        )}

        {/* Actions List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-4 rounded-lg animate-pulse">
                <div className="h-12 bg-muted/50 rounded" />
              </div>
            ))}
          </div>
        ) : filteredActions.length > 0 ? (
          <div className="space-y-3">
            {filteredActions.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </div>
        ) : integrations.length > 0 ? (
          // Filtered but no results
          <EmptyState
            icon={Zap}
            title="No actions found"
            description={`No actions match your ${searchQuery ? 'search' : 'filter'}. Try adjusting your criteria.`}
            className="py-16"
          />
        ) : (
          // No actions at all
          <EmptyState
            icon={Zap}
            title="Automate your workflow"
            description="Trigger actions automatically when someone submits a response to your form."
            actionLabel="Create your first action"
            onAction={() => handleSetupAction()}
            className="py-16"
          />
        )}
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
