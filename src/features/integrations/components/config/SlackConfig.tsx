import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink } from 'lucide-react';

interface SlackConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const SlackConfig = ({ config, onChange }: SlackConfigProps) => {
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

      <div>
        <Label htmlFor="webhookUrl">Slack Webhook URL *</Label>
        <Input
          id="webhookUrl"
          type="url"
          placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
          value={config.webhookUrl || ''}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          className="mt-1 font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Paste your Slack Incoming Webhook URL here
        </p>
      </div>
    </div>
  );
};
