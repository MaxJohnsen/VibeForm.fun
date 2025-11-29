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
      setSelectedType(null);
      setName('');
      setConfig({});
    }
    onOpenChange(open);
  };

  // Since type is always preselected from the palette, skip straight to config
  if (!selectedType) return null;

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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isConfigValid() || isCreating}>
            {isCreating ? 'Creating...' : 'Create Action'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
