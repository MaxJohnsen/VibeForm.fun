import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { IntegrationConfigProps } from '../../types/integrationDefinition';

export const ZapierConfig = ({ 
  config, 
  onChange,
  onSecretChange,
  hasExistingSecret = false,
  disabled,
}: IntegrationConfigProps) => {
  const [showWebhookInput, setShowWebhookInput] = useState(!hasExistingSecret);

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

      {/* Webhook URL - Secure Storage */}
      {hasExistingSecret && !showWebhookInput ? (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Webhook URL saved</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowWebhookInput(true)}
            className="text-xs"
            disabled={disabled}
          >
            Replace webhook
          </Button>
        </div>
      ) : (
        <div>
          <Label htmlFor="webhookUrl">Zapier Webhook URL *</Label>
          <Input
            id="webhookUrl"
            type="url"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={config.webhookUrl || ''}
            onChange={(e) => {
              const value = e.target.value;
              onChange({ ...config, webhookUrl: value });
              onSecretChange?.(value);
            }}
            className="mt-1 font-mono text-sm"
            required
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground mt-1">
            🔒 Your webhook URL will be encrypted and stored securely
          </p>
        </div>
      )}
    </div>
  );
};
