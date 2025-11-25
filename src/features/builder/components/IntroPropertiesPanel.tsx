import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles } from 'lucide-react';
import { IntroSettings } from '../types/screenSettings';
import { RichTextEditor } from '@/shared/ui';

interface IntroPropertiesPanelProps {
  formTitle: string;
  settings: IntroSettings;
  onUpdate: (settings: IntroSettings) => void;
}

export const IntroPropertiesPanel = ({
  formTitle,
  settings,
  onUpdate,
}: IntroPropertiesPanelProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="rounded-lg bg-primary/10 p-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Intro Screen</h2>
          <p className="text-sm text-muted-foreground">
            Customize your welcome screen
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="intro-title">Title</Label>
          <Input
            id="intro-title"
            placeholder={formTitle}
            value={settings.title || ''}
            onChange={(e) => onUpdate({ ...settings, title: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to use form title: "{formTitle}"
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro-description">Description</Label>
          <RichTextEditor
            value={settings.description || ''}
            onChange={(value) =>
              onUpdate({ ...settings, description: value })
            }
            placeholder="Add a description for your form..."
          />
          <p className="text-xs text-muted-foreground">
            Explain what this form is about (supports rich text)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro-button">Button Text</Label>
          <Input
            id="intro-button"
            placeholder="Start"
            value={settings.buttonText || ''}
            onChange={(e) =>
              onUpdate({ ...settings, buttonText: e.target.value })
            }
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-count">Show Question Count</Label>
              <p className="text-xs text-muted-foreground">
                Display total number of questions
              </p>
            </div>
            <Switch
              id="show-count"
              checked={settings.showQuestionCount ?? true}
              onCheckedChange={(checked) =>
                onUpdate({ ...settings, showQuestionCount: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-time">Show Estimated Time</Label>
              <p className="text-xs text-muted-foreground">
                Display estimated completion time
              </p>
            </div>
            <Switch
              id="show-time"
              checked={settings.showEstimatedTime ?? true}
              onCheckedChange={(checked) =>
                onUpdate({ ...settings, showEstimatedTime: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
