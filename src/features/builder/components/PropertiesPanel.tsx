import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TextInput } from '@/shared/ui/TextInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Question } from '../api/questionsApi';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { Settings, Plus, Trash2, GripVertical, GitBranch, ChevronRight } from 'lucide-react';
import {
  RespondentNameSettings,
  MultipleChoiceSettings,
  YesNoSettings,
  RatingSettings,
  EmailSettings,
  PhoneSettings,
  DateSettings,
  ShortTextSettings,
  LongTextSettings,
  getDefaultSettings
} from '../types/questionSettings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PropertiesPanelProps {
  question: Question | null;
  onUpdateLabel: (label: string) => void;
  onUpdateSettings?: (settings: Record<string, any>) => void;
  onDelete: () => void;
  onOpenLogic: () => void;
  className?: string;
  showDelete?: boolean;
}

export const PropertiesPanel = ({
  question,
  onUpdateLabel,
  onUpdateSettings,
  onDelete,
  onOpenLogic,
  className,
  showDelete = true
}: PropertiesPanelProps) => {
  const [localLabel, setLocalLabel] = useState(question?.label || '');
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(
    question?.settings || {}
  );

  // Update local state when question ID changes (narrow dependency to avoid loops)
  useEffect(() => {
    if (!question) return;
    setLocalLabel(question.label ?? '');
    setLocalSettings(question.settings ?? {});
  }, [question?.id]);

  // Handle input change - update local state and trigger debounced save
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalLabel(newValue);
    onUpdateLabel(newValue); // This will be debounced by parent
  };

  // Handle settings update
  const handleSettingsUpdate = (newSettings: Partial<Record<string, any>>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  if (!question) {
    return (
      <div className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Select a question</h3>
          <p className="text-sm text-muted-foreground">
            Click on any question to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const questionType = QUESTION_TYPES.find((t) => t.type === question.type);

  return (
    <div className={cn("p-6 overflow-y-auto space-y-8", className)}>
      {/* Question Type Card */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background shadow-sm", questionType?.colorClass)}>
            {/* We need to render the icon dynamically if possible, or just use a generic one if we can't access the icon component easily here without importing everything. 
                Actually, we can get the icon from questionType.icon if we import it. 
                Wait, QUESTION_TYPES has the icon component. 
             */}
            {questionType?.icon && <questionType.icon className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p className="font-semibold">{questionType?.label}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-background">
          {questionType?.type.replace('_', ' ')}
        </Badge>
      </div>

      {/* Main Settings */}
      <div className="space-y-6">
        <TextInput
          label="Question Text"
          value={localLabel}
          onChange={handleLabelChange}
          placeholder="Enter your question..."
          className="text-lg font-medium"
        />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configuration</h4>

          {/* Type-specific Settings */}
          {question.type === 'respondent_name' && (
            <RespondentNameSettingsPanel
              settings={localSettings as RespondentNameSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'short_text' && (
            <ShortTextSettingsPanel
              settings={localSettings as ShortTextSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'long_text' && (
            <LongTextSettingsPanel
              settings={localSettings as LongTextSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'multiple_choice' && (
            <MultipleChoiceSettingsPanel
              settings={localSettings as MultipleChoiceSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'yes_no' && (
            <YesNoSettingsPanel
              settings={localSettings as YesNoSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'rating' && (
            <RatingSettingsPanel
              settings={localSettings as RatingSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'email' && (
            <EmailSettingsPanel
              settings={localSettings as EmailSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'phone' && (
            <PhoneSettingsPanel
              settings={localSettings as PhoneSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}

          {question.type === 'date' && (
            <DateSettingsPanel
              settings={localSettings as DateSettings}
              onUpdate={handleSettingsUpdate}
            />
          )}
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border/50 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 font-normal hover:bg-muted/50"
            onClick={onOpenLogic}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">Logic Rules</div>
                <div className="text-xs text-muted-foreground">Customize flow based on answers</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          {showDelete && (
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-auto py-3 px-4"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-3" />
              Delete Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Respondent Name Settings Panel
const RespondentNameSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: RespondentNameSettings;
  onUpdate: (s: Partial<RespondentNameSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name-placeholder" className="text-sm font-medium mb-2 block">Placeholder</Label>
        <Input
          id="name-placeholder"
          value={settings.placeholder ?? ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Enter your name..."
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-name" className="text-sm">Required</Label>
        <Switch
          id="required-name"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Short Text Settings Panel
const ShortTextSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: ShortTextSettings;
  onUpdate: (s: Partial<ShortTextSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="short-text-placeholder" className="text-sm font-medium mb-2 block">Placeholder</Label>
        <Input
          id="short-text-placeholder"
          value={settings.placeholder ?? ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Type your answer here..."
        />
      </div>

      <div>
        <Label htmlFor="short-text-max-length" className="text-sm font-medium mb-2 block">Max Length (optional)</Label>
        <Input
          id="short-text-max-length"
          type="number"
          value={settings.maxLength ?? ''}
          onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
          placeholder="No limit"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-short-text" className="text-sm">Required</Label>
        <Switch
          id="required-short-text"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Long Text Settings Panel
const LongTextSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: LongTextSettings;
  onUpdate: (s: Partial<LongTextSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="long-text-placeholder" className="text-sm font-medium mb-2 block">Placeholder</Label>
        <Input
          id="long-text-placeholder"
          value={settings.placeholder ?? ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Type your answer here..."
        />
      </div>

      <div>
        <Label htmlFor="long-text-max-length" className="text-sm font-medium mb-2 block">Max Length (optional)</Label>
        <Input
          id="long-text-max-length"
          type="number"
          value={settings.maxLength ?? ''}
          onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
          placeholder="No limit"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-long-text" className="text-sm">Required</Label>
        <Switch
          id="required-long-text"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Multiple Choice Settings Panel
const MultipleChoiceSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: MultipleChoiceSettings;
  onUpdate: (s: Partial<MultipleChoiceSettings>) => void;
}) => {
  const options = settings.options || [];

  const addOption = () => {
    const newOption = {
      id: Date.now().toString(),
      text: `Option ${options.length + 1}`,
      position: options.length,
    };
    onUpdate({ options: [...options, newOption] });
  };

  const removeOption = (id: string) => {
    onUpdate({ options: options.filter(o => o.id !== id) });
  };

  const updateOption = (id: string, text: string) => {
    onUpdate({
      options: options.map(o => o.id === id ? { ...o, text } : o)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Options</Label>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={option.text ?? ''}
                onChange={(e) => updateOption(option.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addOption}
          className="mt-3 w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="allow-multiple" className="text-sm">Allow multiple selections</Label>
        <Switch
          id="allow-multiple"
          checked={settings.allowMultiple ?? false}
          onCheckedChange={(checked) => onUpdate({ allowMultiple: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="allow-other" className="text-sm">Include "Other" option</Label>
        <Switch
          id="allow-other"
          checked={settings.allowOther ?? false}
          onCheckedChange={(checked) => onUpdate({ allowOther: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-mc" className="text-sm">Required</Label>
        <Switch
          id="required-mc"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Yes/No Settings Panel
const YesNoSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: YesNoSettings;
  onUpdate: (s: Partial<YesNoSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="yes-label" className="text-sm font-medium mb-2 block">Yes Label</Label>
        <Input
          id="yes-label"
          value={settings.yesLabel ?? ''}
          onChange={(e) => onUpdate({ yesLabel: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="no-label" className="text-sm font-medium mb-2 block">No Label</Label>
        <Input
          id="no-label"
          value={settings.noLabel ?? ''}
          onChange={(e) => onUpdate({ noLabel: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-yn" className="text-sm">Required</Label>
        <Switch
          id="required-yn"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Rating Settings Panel
const RatingSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: RatingSettings;
  onUpdate: (s: Partial<RatingSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="scale-type" className="text-sm font-medium mb-2 block">Scale Type</Label>
        <Select
          value={settings.scaleType ?? 'numbers'}
          onValueChange={(value: 'stars' | 'numbers' | 'emoji') => onUpdate({ scaleType: value })}
        >
          <SelectTrigger id="scale-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stars">Stars</SelectItem>
            <SelectItem value="numbers">Numbers</SelectItem>
            <SelectItem value="emoji">Emoji</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="min-value" className="text-sm font-medium mb-2 block">Min Value</Label>
          <Input
            id="min-value"
            type="number"
            value={settings.min ?? ''}
            onChange={(e) => onUpdate({ min: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="max-value" className="text-sm font-medium mb-2 block">Max Value</Label>
          <Input
            id="max-value"
            type="number"
            value={settings.max ?? ''}
            onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 10 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="min-label" className="text-sm font-medium mb-2 block">Min Label (optional)</Label>
        <Input
          id="min-label"
          value={settings.minLabel ?? ''}
          onChange={(e) => onUpdate({ minLabel: e.target.value })}
          placeholder="e.g., Poor"
        />
      </div>

      <div>
        <Label htmlFor="max-label" className="text-sm font-medium mb-2 block">Max Label (optional)</Label>
        <Input
          id="max-label"
          value={settings.maxLabel ?? ''}
          onChange={(e) => onUpdate({ maxLabel: e.target.value })}
          placeholder="e.g., Excellent"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-rating" className="text-sm">Required</Label>
        <Switch
          id="required-rating"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Email Settings Panel
const EmailSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: EmailSettings;
  onUpdate: (s: Partial<EmailSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email-placeholder" className="text-sm font-medium mb-2 block">Placeholder</Label>
        <Input
          id="email-placeholder"
          value={settings.placeholder ?? ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="email@example.com"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-email" className="text-sm">Required</Label>
        <Switch
          id="required-email"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Phone Settings Panel
const PhoneSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: PhoneSettings;
  onUpdate: (s: Partial<PhoneSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phone-format" className="text-sm font-medium mb-2 block">Format</Label>
        <Select
          value={settings.format ?? 'US'}
          onValueChange={(value: 'US' | 'INTERNATIONAL') => onUpdate({ format: value })}
        >
          <SelectTrigger id="phone-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">US Format</SelectItem>
            <SelectItem value="INTERNATIONAL">International</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="phone-placeholder" className="text-sm font-medium mb-2 block">Placeholder</Label>
        <Input
          id="phone-placeholder"
          value={settings.placeholder ?? ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-phone" className="text-sm">Required</Label>
        <Switch
          id="required-phone"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};

// Date Settings Panel
const DateSettingsPanel = ({
  settings,
  onUpdate
}: {
  settings: DateSettings;
  onUpdate: (s: Partial<DateSettings>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="date-format" className="text-sm font-medium mb-2 block">Date Format</Label>
        <Select
          value={settings.format ?? 'MM/DD/YYYY'}
          onValueChange={(value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => onUpdate({ format: value })}
        >
          <SelectTrigger id="date-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="min-date" className="text-sm font-medium mb-2 block">Minimum Date (optional)</Label>
        <Input
          id="min-date"
          type="date"
          value={settings.minDate ?? ''}
          onChange={(e) => onUpdate({ minDate: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="max-date" className="text-sm font-medium mb-2 block">Maximum Date (optional)</Label>
        <Input
          id="max-date"
          type="date"
          value={settings.maxDate ?? ''}
          onChange={(e) => onUpdate({ maxDate: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disable-past" className="text-sm">Disable past dates</Label>
        <Switch
          id="disable-past"
          checked={settings.disablePast ?? false}
          onCheckedChange={(checked) => onUpdate({ disablePast: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disable-future" className="text-sm">Disable future dates</Label>
        <Switch
          id="disable-future"
          checked={settings.disableFuture ?? false}
          onCheckedChange={(checked) => onUpdate({ disableFuture: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-date" className="text-sm">Required</Label>
        <Switch
          id="required-date"
          checked={settings.required ?? false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};
