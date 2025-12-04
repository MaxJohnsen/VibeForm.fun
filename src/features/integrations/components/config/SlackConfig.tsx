import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { VariablePicker } from '../VariablePicker';
import { TemplateVariable } from '../../hooks/useTemplatePreview';
import { useRef, useState } from 'react';
import { SecretFieldConfig } from '../../constants/integrationTypes';

interface SlackConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  variables?: TemplateVariable[];
  onSecretChange?: (value: string) => void;
  hasExistingSecret?: boolean;
  secretField?: SecretFieldConfig;
}

export const SlackConfig = ({ 
  config, 
  onChange, 
  variables = [],
  onSecretChange,
  hasExistingSecret = false,
  secretField,
}: SlackConfigProps) => {
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [showWebhookInput, setShowWebhookInput] = useState(!hasExistingSecret);

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

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p>You'll need to create an Incoming Webhook in Slack.</p>
            {secretField?.helpUrl && (
              <a
                href={secretField.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
              >
                Learn how to create a Slack webhook
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </AlertDescription>
      </Alert>

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
          >
            Replace webhook
          </Button>
        </div>
      ) : (
        <div>
          <Label htmlFor="webhookUrl">{secretField?.label || 'Slack Webhook URL'} *</Label>
          <Input
            id="webhookUrl"
            type="url"
            placeholder={secretField?.placeholder || 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'}
            value={config.webhookUrl || ''}
            onChange={(e) => {
              const value = e.target.value;
              onChange({ ...config, webhookUrl: value });
              onSecretChange?.(value);
            }}
            className="mt-1 font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            🔒 Your webhook URL will be encrypted and stored securely
          </p>
        </div>
      )}

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
