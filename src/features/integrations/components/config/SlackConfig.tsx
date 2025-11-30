import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink } from 'lucide-react';
import { VariablePicker } from '../VariablePicker';
import { TemplateVariable } from '@/shared/utils/templateEngine';
import { useRef } from 'react';
import { SecretInput } from '@/shared/ui';
import { saveIntegrationSecret, updateIntegrationSecret, deleteIntegrationSecret } from '../../api/integrationsApi';

interface SlackConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  variables?: TemplateVariable[];
  integrationId?: string;
  isPending?: boolean;
}

export const SlackConfig = ({ config, onChange, variables = [], integrationId, isPending = false }: SlackConfigProps) => {
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variableKey: string) => {
    if (messageInputRef.current) {
      const input = messageInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentMessage = config.message || '';
      const newValue = currentMessage.substring(0, start) + variableKey + currentMessage.substring(end);
      onChange({ ...config, message: newValue });
      
      // Reset cursor position after the inserted variable
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + variableKey.length, start + variableKey.length);
      }, 0);
    }
  };

  const handleSaveWebhookUrl = async (value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    const secretId = await saveIntegrationSecret(integrationId, value, 'slack_webhook_url');
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
            <p>You'll need to create an Incoming Webhook in Slack.</p>
            <a
              href="https://api.slack.com/messaging/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
            >
              Learn how to create a Slack webhook
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      <SecretInput
        label="Slack Webhook URL *"
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
        placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
        description="Paste your Slack Incoming Webhook URL here"
        isPending={isPending}
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="message">Message Template</Label>
          {variables.length > 0 && (
            <VariablePicker
              variables={variables}
              onSelect={insertVariable}
            />
          )}
        </div>
        <Textarea
          ref={messageInputRef}
          id="message"
          value={config.message || ''}
          onChange={(e) => onChange({ ...config, message: e.target.value })}
          className="min-h-[150px] font-mono text-sm"
          rows={8}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Default template includes all answers formatted
        </p>
      </div>
    </div>
  );
};
