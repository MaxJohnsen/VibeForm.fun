import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TextInput } from '@/shared/ui/TextInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Question } from '../api/questionsApi';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import { 
  MultipleChoiceSettings, 
  YesNoSettings, 
  RatingSettings,
  EmailSettings,
  PhoneSettings,
  DateSettings,
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
}

export const PropertiesPanel = ({ question, onUpdateLabel, onUpdateSettings }: PropertiesPanelProps) => {
  const [localLabel, setLocalLabel] = useState(question?.label || '');
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(
    question?.settings || {}
  );

  // Update local state when question changes
  useEffect(() => {
    if (question?.label !== undefined) {
      setLocalLabel(question.label);
    }
    if (question?.settings !== undefined) {
      setLocalSettings(question.settings);
    }
  }, [question?.id, question?.label, question?.settings]);

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
      <div className="w-80 border-l border-border/50 glass-panel p-6">
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
    <div className="w-80 border-l border-border/50 glass-panel p-6 overflow-y-auto">
      <h2 className="font-semibold mb-6">Question Properties</h2>

      <div className="space-y-6">
        {/* Question Type */}
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            Question Type
          </label>
          <Badge variant="secondary" className="text-sm">
            {questionType?.label}
          </Badge>
        </div>

        {/* Question Label */}
        <TextInput
          label="Question Text"
          value={localLabel}
          onChange={handleLabelChange}
          placeholder="Enter your question..."
        />

        {/* Type-specific Settings */}
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
                value={option.text}
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
          checked={settings.allowMultiple}
          onCheckedChange={(checked) => onUpdate({ allowMultiple: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="allow-other" className="text-sm">Include "Other" option</Label>
        <Switch
          id="allow-other"
          checked={settings.allowOther}
          onCheckedChange={(checked) => onUpdate({ allowOther: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-mc" className="text-sm">Required</Label>
        <Switch
          id="required-mc"
          checked={settings.required}
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
          value={settings.yesLabel}
          onChange={(e) => onUpdate({ yesLabel: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="no-label" className="text-sm font-medium mb-2 block">No Label</Label>
        <Input
          id="no-label"
          value={settings.noLabel}
          onChange={(e) => onUpdate({ noLabel: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-yn" className="text-sm">Required</Label>
        <Switch
          id="required-yn"
          checked={settings.required}
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
          value={settings.scaleType}
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
            value={settings.min}
            onChange={(e) => onUpdate({ min: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="max-value" className="text-sm font-medium mb-2 block">Max Value</Label>
          <Input
            id="max-value"
            type="number"
            value={settings.max}
            onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 10 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="min-label" className="text-sm font-medium mb-2 block">Min Label (optional)</Label>
        <Input
          id="min-label"
          value={settings.minLabel || ''}
          onChange={(e) => onUpdate({ minLabel: e.target.value })}
          placeholder="e.g., Poor"
        />
      </div>

      <div>
        <Label htmlFor="max-label" className="text-sm font-medium mb-2 block">Max Label (optional)</Label>
        <Input
          id="max-label"
          value={settings.maxLabel || ''}
          onChange={(e) => onUpdate({ maxLabel: e.target.value })}
          placeholder="e.g., Excellent"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-rating" className="text-sm">Required</Label>
        <Switch
          id="required-rating"
          checked={settings.required}
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
          value={settings.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="email@example.com"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="require-confirmation" className="text-sm">Require confirmation</Label>
        <Switch
          id="require-confirmation"
          checked={settings.requireConfirmation}
          onCheckedChange={(checked) => onUpdate({ requireConfirmation: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-email" className="text-sm">Required</Label>
        <Switch
          id="required-email"
          checked={settings.required}
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
          value={settings.format}
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
          value={settings.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-phone" className="text-sm">Required</Label>
        <Switch
          id="required-phone"
          checked={settings.required}
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
          value={settings.format}
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
          value={settings.minDate || ''}
          onChange={(e) => onUpdate({ minDate: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="max-date" className="text-sm font-medium mb-2 block">Maximum Date (optional)</Label>
        <Input
          id="max-date"
          type="date"
          value={settings.maxDate || ''}
          onChange={(e) => onUpdate({ maxDate: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disable-past" className="text-sm">Disable past dates</Label>
        <Switch
          id="disable-past"
          checked={settings.disablePast}
          onCheckedChange={(checked) => onUpdate({ disablePast: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="disable-future" className="text-sm">Disable future dates</Label>
        <Switch
          id="disable-future"
          checked={settings.disableFuture}
          onCheckedChange={(checked) => onUpdate({ disableFuture: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="required-date" className="text-sm">Required</Label>
        <Switch
          id="required-date"
          checked={settings.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
};
