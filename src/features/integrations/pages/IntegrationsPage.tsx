import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Plug } from 'lucide-react';
import { useState } from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { IntegrationCard } from '../components/IntegrationCard';
import { AvailableIntegrationCard } from '../components/AvailableIntegrationCard';
import { AddIntegrationDialog } from '../components/AddIntegrationDialog';
import { INTEGRATION_TYPES, IntegrationTypeInfo } from '../constants/integrationTypes';
import { IntegrationType } from '../api/integrationsApi';

export const IntegrationsPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<IntegrationType | undefined>();
  const { integrations, isLoading } = useIntegrations(formId!);

  const configuredTypes = new Set(integrations.map((i) => i.type));
  const availableTypes = INTEGRATION_TYPES.filter((t) => !configuredTypes.has(t.type));

  const handleSetupIntegration = (type?: IntegrationType) => {
    setPreselectedType(type);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setPreselectedType(undefined);
    }
  };

  // Empty State - No integrations configured yet
  if (integrations.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Plug className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Connect your form
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Automate workflows when responses are submitted. Choose an integration to get started.
            </p>
          </div>

          {/* Available Integrations Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {INTEGRATION_TYPES.map((type) => (
              <AvailableIntegrationCard
                key={type.type}
                typeInfo={type}
                onSetup={() => handleSetupIntegration(type.type)}
              />
            ))}
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
  }

  // Populated State - Has integrations
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Connect</h1>
              <p className="text-muted-foreground mt-2">
                Automate actions when form responses are submitted
              </p>
            </div>
            {availableTypes.length > 0 && (
              <Button onClick={() => handleSetupIntegration()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            )}
          </div>
        </div>

        {/* Active Integrations */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Your Integrations
          </h2>
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>

        {/* Add More Section - Only show if there are available types */}
        {availableTypes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Add More
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {availableTypes.map((type) => (
                <AvailableIntegrationCard
                  key={type.type}
                  typeInfo={type}
                  onSetup={() => handleSetupIntegration(type.type)}
                />
              ))}
            </div>
          </div>
        )}

        <AddIntegrationDialog
          formId={formId!}
          open={isAddDialogOpen}
          onOpenChange={handleDialogClose}
          preselectedType={preselectedType}
        />
      </div>
    </div>
  );
};
