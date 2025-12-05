import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIntegrations } from '../hooks/useIntegrations';
import { ActionCard } from '../components/ActionCard';
import { ActionConfigForm } from '../components/ActionConfigForm';
import { IntegrationTypePalette } from '../components/IntegrationTypePalette';
import { SearchBar, SlidePanel, AppShell, AppHeader } from '@/shared/ui';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Integration, IntegrationType, saveIntegrationSecret } from '../api/integrationsApi';
import { ROUTES } from '@/shared/constants/routes';
import { getIntegration, getAllIntegrations } from '../integrations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [isSavingAction, setIsSavingAction] = useState(false);

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

  const handleSelectType = (type: string) => {
    setActiveAction({ mode: 'create', type: type as IntegrationType });
    setIsTypeSheetOpen(false);
  };

  const handleEditAction = (action: Integration) => {
    setActiveAction({ mode: 'edit', type: action.type, action });
  };

  const handleSaveAction = async (data: Omit<Integration, 'id' | 'created_at' | 'updated_at'> & { _pendingSecret?: string }) => {
    setIsSavingAction(true);
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
        const integrationDef = getIntegration(data.type);
        const secretField = integrationDef?.secretField;
        
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
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleClosePanel = () => {
    setActiveAction(null);
  };

  // Get integration info for panel title
  const activeIntegrationDef = activeAction?.type 
    ? getIntegration(activeAction.type) 
    : null;

  const sidebarContent = (
    <IntegrationTypePalette
      onSelectType={(type) => handleSelectType(type)}
      className="border-none"
      disabled={isSavingAction}
    />
  );

  return (
    <>
      <AppShell
        header={
          <AppHeader
            title={form?.title || ''}
            subtitle="Actions • Automate workflows when responses are submitted"
            backTo={ROUTES.getBuilderRoute(formId!)}
            actions={
              isMobile ? (
                <Button size="sm" className="gap-2" onClick={() => setIsTypeSheetOpen(true)} disabled={isSavingAction}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              ) : undefined
            }
          />
        }
        leftSidebar={sidebarContent}
        sidebarTitle="Add Integration"
        mobileSheetOpen={isTypeSheetOpen}
        onMobileSheetOpenChange={setIsTypeSheetOpen}
        hideMobileTrigger
      >
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto h-full">
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
                  {getAllIntegrations().map((integration) => (
                    <SelectItem key={integration.type} value={integration.type}>
                      {integration.label}
                    </SelectItem>
                  ))}
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
              description={isMobile ? "Tap 'Add' to create your first action" : "Select an integration from the left to create your first action"}
            />
          ) : filteredActions.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No matching actions"
              description="Try adjusting your search or filter"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredActions.map((action) => (
                <ActionCard
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
      </AppShell>

      {/* Action Configuration SlidePanel */}
      <SlidePanel
        open={!!activeAction}
        onOpenChange={(open) => {
          if (isSavingAction) return;
          if (!open) handleClosePanel();
        }}
        title={`${activeAction?.mode === 'edit' ? 'Edit' : 'Create'} ${activeIntegrationDef?.label || ''} Action`}
        description={activeIntegrationDef?.description}
        size="md"
        icon={activeIntegrationDef?.icon && (
          <activeIntegrationDef.icon className="h-5 w-5 text-muted-foreground" />
        )}
      >
        {activeAction?.type && (
          <ActionConfigForm
            formId={formId!}
            type={activeAction.type}
            action={activeAction.action}
            onSave={handleSaveAction}
            onCancel={handleClosePanel}
            isSaving={isSavingAction}
          />
        )}
      </SlidePanel>
    </>
  );
};
