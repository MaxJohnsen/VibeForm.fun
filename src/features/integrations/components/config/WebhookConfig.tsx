import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SecretInput } from '@/shared/ui';
import { saveIntegrationSecret, updateIntegrationSecret, deleteIntegrationSecret } from '../../api/integrationsApi';

interface WebhookConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  integrationId?: string;
}

export const WebhookConfig = ({ config, onChange, integrationId }: WebhookConfigProps) => {
  const handleHeadersChange = (value: string) => {
    try {
      const headers = value ? JSON.parse(value) : {};
      onChange({ ...config, headers });
    } catch (e) {
      // Invalid JSON, don't update
    }
  };

  const handleSaveUrl = async (value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    const secretId = await saveIntegrationSecret(integrationId, value, 'webhook_url');
    return secretId;
  };

  const handleUpdateUrl = async (secretId: string, value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    await updateIntegrationSecret(integrationId, secretId, value);
  };

  const handleDeleteUrl = async (secretId: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    await deleteIntegrationSecret(integrationId, secretId);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Sends form response data as JSON to your custom endpoint.
        </AlertDescription>
      </Alert>

      <SecretInput
        label="Webhook URL *"
        value={config.url}
        secretId={config.urlSecretId}
        onChange={(value, secretId) => {
          onChange({
            ...config,
            url: value,
            urlSecretId: secretId,
          });
        }}
        onSave={handleSaveUrl}
        onUpdate={handleUpdateUrl}
        onDelete={handleDeleteUrl}
        placeholder="https://your-api.com/webhook"
      />

      <div>
        <Label htmlFor="method">HTTP Method</Label>
        <Select
          value={config.method || 'POST'}
          onValueChange={(value) => onChange({ ...config, method: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="headers">Custom Headers (Optional)</Label>
        <Textarea
          id="headers"
          placeholder={'{\n  "Authorization": "Bearer token",\n  "X-Custom-Header": "value"\n}'}
          value={config.headers ? JSON.stringify(config.headers, null, 2) : ''}
          onChange={(e) => handleHeadersChange(e.target.value)}
          className="mt-1 font-mono text-sm"
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">JSON format</p>
      </div>
    </div>
  );
};
