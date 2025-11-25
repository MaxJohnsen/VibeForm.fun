import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2 } from 'lucide-react';
import { EndSettings } from '../types/screenSettings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EndPropertiesPanelProps {
  settings: EndSettings;
  onUpdate: (settings: EndSettings) => void;
}

export const EndPropertiesPanel = ({
  settings,
  onUpdate,
}: EndPropertiesPanelProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="rounded-lg bg-primary/10 p-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">End Screen</h2>
          <p className="text-sm text-muted-foreground">
            Customize your completion screen
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="end-title">Title</Label>
          <Input
            id="end-title"
            placeholder="Thank you!"
            value={settings.title || ''}
            onChange={(e) => onUpdate({ ...settings, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-message">Message</Label>
          <Textarea
            id="end-message"
            placeholder="Your response has been submitted successfully."
            value={settings.message || ''}
            onChange={(e) => onUpdate({ ...settings, message: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Custom message to display after form completion
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-button">Button Text</Label>
          <Input
            id="end-button"
            placeholder="Close"
            value={settings.buttonText || ''}
            onChange={(e) =>
              onUpdate({ ...settings, buttonText: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-action">Button Action</Label>
          <Select
            value={settings.buttonAction || 'close'}
            onValueChange={(value: 'close' | 'redirect' | 'restart') =>
              onUpdate({ ...settings, buttonAction: value })
            }
          >
            <SelectTrigger id="button-action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="close">Close window</SelectItem>
              <SelectItem value="redirect">Redirect to URL</SelectItem>
              <SelectItem value="restart">Restart form</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.buttonAction === 'redirect' && (
          <div className="space-y-2">
            <Label htmlFor="redirect-url">Redirect URL</Label>
            <Input
              id="redirect-url"
              type="url"
              placeholder="https://example.com"
              value={settings.redirectUrl || ''}
              onChange={(e) =>
                onUpdate({ ...settings, redirectUrl: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Where to redirect after form completion
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
