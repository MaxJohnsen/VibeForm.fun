import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Plus, X } from 'lucide-react';
import { IntegrationConfigProps } from '../../types/integrationDefinition';

type HeaderEntry = { key: string; value: string };

const HeadersEditor = ({ 
  headers, 
  onChange, 
  disabled 
}: { 
  headers: Record<string, string>; 
  onChange: (headers: Record<string, string>) => void;
  disabled?: boolean;
}) => {
  // Convert object to array for editing
  const entries: HeaderEntry[] = Object.entries(headers || {}).map(([key, value]) => ({ key, value }));
  
  const updateEntries = (newEntries: HeaderEntry[]) => {
    const newHeaders: Record<string, string> = {};
    newEntries.forEach(({ key, value }) => {
      if (key.trim()) {
        newHeaders[key.trim()] = value;
      }
    });
    onChange(newHeaders);
  };

  const addHeader = () => {
    updateEntries([...entries, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    updateEntries(newEntries);
  };

  const updateHeader = (index: number, field: 'key' | 'value', newValue: string) => {
    const newEntries = entries.map((entry, i) => 
      i === index ? { ...entry, [field]: newValue } : entry
    );
    updateEntries(newEntries);
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Header name"
            value={entry.key}
            onChange={(e) => updateHeader(index, 'key', e.target.value)}
            className="flex-1 font-mono text-sm"
            disabled={disabled}
          />
          <Input
            placeholder="Value"
            value={entry.value}
            onChange={(e) => updateHeader(index, 'value', e.target.value)}
            className="flex-1 font-mono text-sm"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeHeader(index)}
            disabled={disabled}
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addHeader}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Header
      </Button>
    </div>
  );
};

export const WebhookConfig = ({ config, onChange, disabled }: IntegrationConfigProps) => {
  // Normalize headers: handle both string (legacy) and object formats
  const normalizeHeaders = (headers: unknown): Record<string, string> => {
    if (!headers) return {};
    if (typeof headers === 'string') {
      try {
        return JSON.parse(headers);
      } catch {
        return {};
      }
    }
    return headers as Record<string, string>;
  };

  const headers = normalizeHeaders(config.headers);

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
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Custom Headers (Optional)</Label>
        <div className="mt-2">
          <HeadersEditor
            headers={headers}
            onChange={(newHeaders) => onChange({ ...config, headers: newHeaders })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
