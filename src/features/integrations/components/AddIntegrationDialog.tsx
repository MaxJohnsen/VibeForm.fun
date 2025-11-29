import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { useIntegrations } from '../hooks/useIntegrations';
import { IntegrationType } from '../api/integrationsApi';
import { EmailConfig } from './config/EmailConfig';
import { SlackConfig } from './config/SlackConfig';
import { WebhookConfig } from './config/WebhookConfig';
import { ZapierConfig } from './config/ZapierConfig';

interface AddIntegrationDialogProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedType?: IntegrationType;
}

export const AddIntegrationDialog = ({ 
  formId, 
  open, 
  onOpenChange,
  preselectedType 
}: AddIntegrationDialogProps) => {
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
  const [name, setName] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const { createIntegration, isCreating } = useIntegrations(formId);

  // Sync selectedType with preselectedType when dialog opens
  useEffect(() => {
    if (open && preselectedType) {
      setSelectedType(preselectedType);
    }
  }, [open, preselectedType]);

  const isConfigValid = () => {
    if (!selectedType || !name) return false;

    switch (selectedType) {
      case 'email':
        return !!(config.recipient && config.subject);
      case 'slack':
        return !!(config.webhookUrl);
      case 'webhook':
        return !!(config.url);
      case 'zapier':
        return !!(config.webhookUrl);
      default:
        return false;
    }
  };

  const handleCreate = () => {
    if (!isConfigValid()) return;

    createIntegration({
      form_id: formId,
      type: selectedType,
      name,
      enabled: true,
      trigger: 'form_completed',
      config,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedType(null);
    setName('');
    setConfig({});
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedType(preselectedType || null);
      setName('');
      setConfig({});
    }
    onOpenChange(open);
  };

  const handleBack = () => {
    setSelectedType(null);
    setName('');
    setConfig({});
  };

  if (!selectedType) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Choose which action you want to trigger when responses are submitted
            </p>
            {INTEGRATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className="glass-panel p-4 rounded-lg text-left hover:scale-[1.02] transition-transform w-full"
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
        </DialogContent>
      </Dialog>
    );
  }

  const typeInfo = INTEGRATION_TYPES.find((t) => t.type === selectedType)!;
  const Icon = typeInfo.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted/50 ${typeInfo.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <DialogTitle>Configure {typeInfo.label} Action</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Action Name</Label>
            <Input
              id="name"
              placeholder={`e.g. Send response summary to team`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          {selectedType === 'email' && <EmailConfig config={config} onChange={setConfig} />}
          {selectedType === 'slack' && <SlackConfig config={config} onChange={setConfig} />}
          {selectedType === 'webhook' && <WebhookConfig config={config} onChange={setConfig} />}
          {selectedType === 'zapier' && <ZapierConfig config={config} onChange={setConfig} />}
        </div>

        <div className="flex justify-between gap-2">
          {!preselectedType && (
            <Button variant="ghost" onClick={handleBack} disabled={isCreating}>
              ← Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isCreating}>
              Cancel
            </Button>
              <Button onClick={handleCreate} disabled={!isConfigValid() || isCreating}>
                {isCreating ? 'Creating...' : 'Create Action'}
              </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
