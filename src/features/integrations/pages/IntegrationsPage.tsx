import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import { IntegrationCard } from '../components/IntegrationCard';
import { AddIntegrationDialog } from '../components/AddIntegrationDialog';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';

export const IntegrationsPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { integrations, isLoading } = useIntegrations(formId!);

  const configuredTypes = new Set(integrations.map((i) => i.type));
  const availableTypes = INTEGRATION_TYPES.filter((t) => !configuredTypes.has(t.type));

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
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Active Integrations */}
        {integrations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Active Integrations</h2>
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        {availableTypes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Available Integrations</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {availableTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    onClick={() => setIsAddDialogOpen(true)}
                    className="glass-panel p-6 rounded-xl text-left hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-muted/50 ${type.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {integrations.length === 0 && !isLoading && (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2 text-foreground">No integrations yet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your form to external services to automate workflows when responses are submitted.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Integration
              </Button>
            </div>
          </div>
        )}

        <AddIntegrationDialog
          formId={formId!}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    </div>
  );
};
