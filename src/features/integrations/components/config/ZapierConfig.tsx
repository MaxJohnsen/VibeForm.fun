import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink } from 'lucide-react';
import { SecretInput } from '@/shared/ui';
import { saveIntegrationSecret, updateIntegrationSecret, deleteIntegrationSecret } from '../../api/integrationsApi';

interface ZapierConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  integrationId?: string;
}

export const ZapierConfig = ({ config, onChange, integrationId }: ZapierConfigProps) => {
  const handleSaveWebhookUrl = async (value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    const secretId = await saveIntegrationSecret(integrationId, value, 'zapier_webhook_url');
    return secretId;
  };

  const handleUpdateWebhookUrl = async (secretId: string, value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    await updateIntegrationSecret(integrationId, secretId, value);
  };

  const handleDeleteWebhookUrl = async (secretId: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    await deleteIntegrationSecret(integrationId, secretId);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p>Connect your form to thousands of apps via Zapier.</p>
            <a
              href="https://zapier.com/apps/webhook/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
            >
              Learn how to create a Zapier webhook trigger
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Setup Instructions:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Create a new Zap in Zapier</li>
          <li>Choose "Webhooks by Zapier" as the trigger</li>
          <li>Select "Catch Hook"</li>
          <li>Copy the webhook URL and paste it below</li>
          <li>Configure your desired actions in Zapier</li>
        </ol>
      </div>

      <SecretInput
        label="Zapier Webhook URL *"
        value={config.webhookUrl}
        secretId={config.webhookUrlSecretId}
        onChange={(value, secretId) => {
          onChange({
            ...config,
            webhookUrl: value,
            webhookUrlSecretId: secretId,
          });
        }}
        onSave={handleSaveWebhookUrl}
        onUpdate={handleUpdateWebhookUrl}
        onDelete={handleDeleteWebhookUrl}
        placeholder="https://hooks.zapier.com/hooks/catch/..."
        description="Your Zapier Catch Hook URL"
      />
    </div>
  );
};
