import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { IntegrationConfigProps } from '../../types/integrationDefinition';

export const WebhookConfig = ({ config, onChange, disabled }: IntegrationConfigProps) => {
  const handleHeadersChange = (value: string) => {
    try {
      const headers = value ? JSON.parse(value) : {};
      onChange({ ...config, headers });
    } catch (e) {
      // Invalid JSON, don't update
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Sends form response data as JSON to your custom endpoint.
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="url">Webhook URL *</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://your-api.com/webhook"
          value={config.url || ''}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          className="mt-1 font-mono text-sm"
          required
          disabled={disabled}
        />
      </div>

      <div>
        <Label htmlFor="method">HTTP Method</Label>
        <Select
          value={config.method || 'POST'}
          onValueChange={(value) => onChange({ ...config, method: value })}
          disabled={disabled}
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
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">JSON format</p>
      </div>
    </div>
  );
};
