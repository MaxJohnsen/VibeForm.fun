import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EmailConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const EmailConfig = ({ config, onChange }: EmailConfigProps) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Emails will be sent from our domain using Resend. Make sure RESEND_API_KEY is configured.
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="recipient">Recipient Email *</Label>
        <Input
          id="recipient"
          type="email"
          placeholder="notifications@example.com"
          value={config.recipient || ''}
          onChange={(e) => onChange({ ...config, recipient: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="subject">Email Subject *</Label>
        <Input
          id="subject"
          placeholder="New form response received"
          value={config.subject || ''}
          onChange={(e) => onChange({ ...config, subject: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="bodyTemplate">Custom Body Template (Optional)</Label>
        <Textarea
          id="bodyTemplate"
          placeholder="Leave empty for default template with all answers"
          value={config.bodyTemplate || ''}
          onChange={(e) => onChange({ ...config, bodyTemplate: e.target.value })}
          className="mt-1"
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use variables like {'{'}form_title{'}'}, {'{'}response_count{'}'} in your template
        </p>
      </div>
    </div>
  );
};
