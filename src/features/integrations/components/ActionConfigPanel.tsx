import { useState, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlassCard } from '@/shared/ui/GlassCard';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { VariablePicker } from './VariablePicker';
import { ActionPreview } from './ActionPreview';
import { useTemplatePreview } from '../hooks/useTemplatePreview';
import { getAvailableVariables } from '@/shared/utils/templateEngine';
import { Integration, IntegrationType } from '../api/integrationsApi';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { SlackConfig } from './config/SlackConfig';
import { WebhookConfig } from './config/WebhookConfig';
import { ZapierConfig } from './config/ZapierConfig';

interface ActionConfigPanelProps {
  formId: string;
  type: IntegrationType;
  action?: Integration;
  onSave: (data: Omit<Integration, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const getDefaultConfig = (type: IntegrationType): Record<string, any> => {
  switch (type) {
    case 'email':
      return {
        recipient: '',
        subject: 'New response: {{form_title}}',
        bodyTemplate: `Hi team,

We received a new form response!

{{all_answers}}

---
Submitted at: {{submitted_at}}
Response ID: {{response_id}}`,
      };
    case 'slack':
      return {
        webhookUrl: '',
        message: `📋 *New Response: {{form_title}}*

{{all_answers}}

_Submitted at {{submitted_at}}_`,
      };
    case 'webhook':
      return {
        url: '',
        method: 'POST',
        headers: '{"Content-Type": "application/json"}',
      };
    case 'zapier':
      return {
        webhookUrl: '',
      };
    default:
      return {};
  }
};

export const ActionConfigPanel = ({
  formId,
  type,
  action,
  onSave,
  onCancel,
  isSaving,
}: ActionConfigPanelProps) => {
  const integrationInfo = INTEGRATION_TYPES.find(t => t.type === type);
  const [name, setName] = useState(action?.name || `${integrationInfo?.label} notification`);
  const [config, setConfig] = useState<Record<string, any>>(action?.config || getDefaultConfig(type));
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: previewData, isLoading: isLoadingPreview } = useTemplatePreview(formId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      form_id: formId,
      type,
      name,
      config,
      enabled: action?.enabled ?? true,
      trigger: action?.trigger || 'form_completed',
    });
  };

  const insertVariable = (field: 'subject' | 'body', variable: string) => {
    if (field === 'subject' && subjectInputRef.current) {
      const input = subjectInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentSubject = config.subject || '';
      const newValue = 
        currentSubject.substring(0, start) + 
        variable + 
        currentSubject.substring(end);
      setConfig({ ...config, subject: newValue });
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else if (field === 'body' && bodyTextareaRef.current) {
      const textarea = bodyTextareaRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const currentBody = config.bodyTemplate || '';
      const newValue = 
        currentBody.substring(0, start) + 
        variable + 
        currentBody.substring(end);
      setConfig({ ...config, bodyTemplate: newValue });
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  // Build preview content
  const processedContent = previewData ? {
    subject: config.subject ? previewData.processTemplate(config.subject) : undefined,
    body: type === 'email' 
      ? (config.bodyTemplate 
          ? previewData.processTemplate(config.bodyTemplate)
          : String(previewData.context.all_answers))
      : type === 'slack'
      ? (config.message
          ? previewData.processTemplate(config.message)
          : `New response for ${previewData.form.title}\n\n${String(previewData.context.all_answers)}`)
      : undefined,
    recipient: config.recipient,
    payload: (type === 'webhook' || type === 'zapier') ? {
      formId,
      formTitle: previewData.form.title,
      responseId: 'sample-response-id',
      submittedAt: String(previewData.context.submitted_at),
      answers: previewData.sampleAnswers.map((a: any) => ({
        questionId: a.question_id,
        answer: a.answer_value,
      })),
    } : undefined,
  } : {};

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              {integrationInfo?.icon && (
                <integrationInfo.icon className="h-5 w-5 text-muted-foreground" />
              )}
              <h1 className="text-lg font-semibold">
                {action ? 'Edit' : 'Create'} {integrationInfo?.label} Action
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="trigger" className="text-sm text-muted-foreground">
                Trigger:
              </Label>
              <select
                id="trigger"
                value={action?.trigger || 'form_completed'}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                disabled
              >
                <option value="form_completed">On form completed</option>
                <option value="form_started">On form started</option>
                <option value="question_answered">On question answered</option>
              </select>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !name || !isConfigValid()}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {action ? 'Save Changes' : 'Create Action'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Configuration (Left) */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Action Name */}
                  <div>
                    <Label htmlFor="name">Action Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Send response summary to team"
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div className="border-t border-border/50 pt-6">
                    {type === 'email' && (
                      <EmailConfiguration
                        config={config}
                        onChange={setConfig}
                        variables={previewData ? getAvailableVariables(previewData.questions) : []}
                        onInsertVariable={insertVariable}
                        subjectRef={subjectInputRef}
                        bodyRef={bodyTextareaRef}
                        isLoadingVariables={isLoadingPreview}
                      />
                    )}

                    {type === 'slack' && (
                      <SlackConfig
                        config={config}
                        onChange={setConfig}
                        variables={previewData ? getAvailableVariables(previewData.questions) : []}
                      />
                    )}

                    {type === 'webhook' && (
                      <WebhookConfig config={config} onChange={setConfig} />
                    )}

                    {type === 'zapier' && (
                      <ZapierConfig config={config} onChange={setConfig} />
                    )}
                  </div>
                </form>
              </GlassCard>
            </div>

            {/* Preview (Right) */}
            <div>
              <GlassCard className="p-6 lg:sticky lg:top-6 transition-all duration-300">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : previewData ? (
                  <ActionPreview
                    type={type}
                    config={config}
                    processedContent={processedContent}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Preview unavailable
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function isConfigValid(): boolean {
    switch (type) {
      case 'email':
        return !!config.recipient && !!config.subject;
      case 'slack':
        return !!config.webhookUrl;
      case 'webhook':
        return !!config.url;
      case 'zapier':
        return !!config.webhookUrl;
      default:
        return false;
    }
  }
};

// Email-specific configuration component
const EmailConfiguration = ({
  config,
  onChange,
  variables,
  onInsertVariable,
  subjectRef,
  bodyRef,
  isLoadingVariables,
}: any) => {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription className="text-sm">
          Emails will be sent using Resend. Make sure RESEND_API_KEY is configured in your secrets.
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
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="subject">Email Subject *</Label>
          {!isLoadingVariables && (
            <VariablePicker
              variables={variables}
              onSelect={(v) => onInsertVariable('subject', v)}
            />
          )}
        </div>
        <Input
          ref={subjectRef}
          id="subject"
          value={config.subject || ''}
          onChange={(e) => onChange({ ...config, subject: e.target.value })}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {`{{variable}}`} syntax to insert dynamic content
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="bodyTemplate">Email Body</Label>
          {!isLoadingVariables && (
            <VariablePicker
              variables={variables}
              onSelect={(v) => onInsertVariable('body', v)}
            />
          )}
        </div>
        <Textarea
          ref={bodyRef}
          id="bodyTemplate"
          value={config.bodyTemplate || ''}
          onChange={(e) => onChange({ ...config, bodyTemplate: e.target.value })}
          className="font-mono text-sm min-h-[200px]"
          rows={10}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Default template includes all answers formatted
        </p>
      </div>
    </div>
  );
};
