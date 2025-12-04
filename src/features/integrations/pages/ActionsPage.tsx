import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Loader2, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntegrations } from '../hooks/useIntegrations';
import { ActionRow } from '../components/ActionRow';
import { ActionConfigForm } from '../components/ActionConfigForm';
import { SearchBar } from '@/shared/ui/SearchBar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SlidePanel } from '@/shared/ui/SlidePanel';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Integration, IntegrationType, saveIntegrationSecret } from '../api/integrationsApi';
import { ROUTES } from '@/shared/constants/routes';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IntegrationTypePalette } from '../components/IntegrationTypePalette';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export const ActionsPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { integrations, isLoading, createIntegrationAsync, updateIntegrationAsync, deleteIntegration, updateIntegration, isCreating, isUpdating } = useIntegrations(formId!);

  const [activeAction, setActiveAction] = useState<{
    mode: 'create' | 'edit';
    type?: IntegrationType;
    action?: Integration;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<IntegrationType | undefined>();
  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('title')
        .eq('id', formId!)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const filteredActions = integrations.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || action.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSelectType = (type: IntegrationType) => {
    setActiveAction({ mode: 'create', type });
    setIsTypeSheetOpen(false);
  };

  const handleEditAction = (action: Integration) => {
    setActiveAction({ mode: 'edit', type: action.type, action });
  };

  const handleSaveAction = async (data: Omit<Integration, 'id' | 'created_at' | 'updated_at'> & { _pendingSecret?: string }) => {
    try {
      const { _pendingSecret, ...integrationData } = data;
      let integrationId: string;
      
      if (activeAction?.mode === 'create') {
        const result = await createIntegrationAsync(integrationData);
        integrationId = result.id;
      } else if (activeAction?.mode === 'edit' && activeAction.action) {
        await updateIntegrationAsync({ id: activeAction.action.id, updates: integrationData });
        integrationId = activeAction.action.id;
      } else {
        return;
      }
      
      if (_pendingSecret) {
        const integrationTypeInfo = INTEGRATION_TYPES.find(t => t.type === data.type);
        const secretField = integrationTypeInfo?.secretField;
        
        if (secretField) {
          const secretMode = activeAction?.mode === 'create' ? 'insert' : 'update';
          await saveIntegrationSecret(integrationId, secretField.key, _pendingSecret, secretMode);
        }
      }
      
      toast.success(_pendingSecret 
        ? 'Action saved with secure credentials' 
        : 'Action saved successfully');
      
      setActiveAction(null);
    } catch (error) {
      console.error('Error saving action:', error);
      toast.error('Failed to save action');
    }
  };

  const handleClosePanel = () => {
    setActiveAction(null);
  };

  // Get integration info for panel title
  const activeIntegrationInfo = activeAction?.type 
    ? INTEGRATION_TYPES.find(t => t.type === activeAction.type) 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.getBuilderRoute(formId!))}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                {form?.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Actions • Automate workflows when responses are submitted
              </p>
            </div>
            {/* Mobile: Show Add button */}
            {isMobile && (
              <Sheet open={isTypeSheetOpen} onOpenChange={setIsTypeSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Add Integration</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <IntegrationTypePalette
                      onSelectType={handleSelectType}
                      className="border-none"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex">
        {/* Left Sidebar - Integration Types (Desktop only) */}
        {!isMobile && (
          <div className="w-64 border-r border-border/50 bg-background/50 backdrop-blur-sm">
            <IntegrationTypePalette onSelectType={handleSelectType} />
          </div>
        )}

        {/* Main Area - Actions List */}
        <div className="flex-1">
          <div className="p-4 sm:p-6 space-y-4">
            {/* Search and Filter Bar (only when actions exist) */}
            {integrations.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search actions..."
                  />
                </div>
                <Select
                  value={selectedType || 'all'}
                  onValueChange={(value) => setSelectedType(value === 'all' ? undefined : value as IntegrationType)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="zapier">Zapier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions List or Empty State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredActions.length === 0 && integrations.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No actions yet"
                description="Select an integration from the left to create your first action"
              />
            ) : filteredActions.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No matching actions"
                description="Try adjusting your search or filter"
              />
            ) : (
              <div className="space-y-3">
                {filteredActions.map((action) => (
                  <ActionRow
                    key={action.id}
                    action={action}
                    onEdit={() => handleEditAction(action)}
                    onUpdate={(id, updates) => updateIntegration({ id, updates })}
                    onDelete={deleteIntegration}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Configuration SlidePanel */}
      <SlidePanel
        open={!!activeAction}
        onOpenChange={(open) => !open && handleClosePanel()}
        title={`${activeAction?.mode === 'edit' ? 'Edit' : 'Create'} ${activeIntegrationInfo?.label || ''} Action`}
        description={activeIntegrationInfo?.description}
        size="md"
        icon={activeIntegrationInfo?.icon && (
          <activeIntegrationInfo.icon className="h-5 w-5 text-muted-foreground" />
        )}
      >
        {activeAction?.type && (
          <ActionConfigForm
            formId={formId!}
            type={activeAction.type}
            action={activeAction.action}
            onSave={handleSaveAction}
            onCancel={handleClosePanel}
            isSaving={isCreating || isUpdating}
          />
        )}
      </SlidePanel>
    </div>
  );
};
