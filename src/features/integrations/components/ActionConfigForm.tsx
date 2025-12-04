import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/shared/ui/GlassCard';
import { VariablePicker } from './VariablePicker';
import { ActionPreview } from './ActionPreview';
import { useTemplatePreview } from '../hooks/useTemplatePreview';
import { Integration, IntegrationType } from '../api/integrationsApi';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { SlackConfig } from './config/SlackConfig';
import { WebhookConfig } from './config/WebhookConfig';
import { ZapierConfig } from './config/ZapierConfig';

interface ActionConfigFormProps {
  formId: string;
  type: IntegrationType;
  action?: Integration;
  onSave: (data: Omit<Integration, 'id' | 'created_at' | 'updated_at'> & { _pendingSecret?: string }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const getDefaultConfig = (type: IntegrationType): Record<string, any> => {
  switch (type) {
    case 'email':
      return {
        useCustomApiKey: false,
        to: '',
        cc: '',
        bcc: '',
        subject: 'New response: {{form_title}}',
        bodyTemplate: `<h1>{{form_title}}</h1>

We received a new form response!

{{all_answers_html}}

—

<p>Submitted at: {{submitted_at}}</p>
<p>Response ID: {{response_id}}</p>`,
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

export const ActionConfigForm = ({
  formId,
  type,
  action,
  onSave,
  onCancel,
  isSaving,
}: ActionConfigFormProps) => {
  const integrationInfo = INTEGRATION_TYPES.find(t => t.type === type);
  const [name, setName] = useState(action?.name || `${integrationInfo?.label} notification`);
  const [config, setConfig] = useState<Record<string, any>>(action?.config || getDefaultConfig(type));
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: previewData, isLoading: isLoadingPreview } = useTemplatePreview(formId);
  
  const [pendingSecret, setPendingSecret] = useState<string>('');
  const hasExistingSecret = !!action?.id && !!integrationInfo?.secretField;
  
  // For email: backward compatibility
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(!!action?.id && !!action?.config?.useCustomApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const safeConfig = { ...config };
    
    if (integrationInfo?.secretField?.configPath) {
      delete safeConfig[integrationInfo.secretField.configPath];
    }
    delete safeConfig.customApiKey;
    
    const integrationData: any = {
      form_id: formId,
      type,
      name,
      config: safeConfig,
      enabled: action?.enabled ?? true,
      trigger: action?.trigger || 'form_completed',
    };
    
    if (pendingSecret) {
      integrationData._pendingSecret = pendingSecret;
    }
    
    if (customApiKey && config.useCustomApiKey) {
      integrationData._pendingSecret = customApiKey;
    }
    
    onSave(integrationData);
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
    to: config.to || config.recipient,
    cc: config.cc,
    bcc: config.bcc,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    useCustomApiKey: config.useCustomApiKey,
    payload: (type === 'webhook' || type === 'zapier') ? {
      form_id: formId,
      form_title: previewData.form.title,
      form_slug: previewData.form.slug || '',
      response_id: 'sample-response-id',
      completed_at: new Date().toISOString(),
      answers: previewData.sampleAnswers.map((a: any) => {
        const question = previewData.questions.find((q: any) => q.id === a.question_id);
        return {
          question_id: a.question_id,
          question_label: question?.label || 'Unknown',
          question_type: question?.type || 'unknown',
          answer: a.answer_value,
        };
      }),
      metadata: {
        submitted_at: String(previewData.context.submitted_at),
        response_number: String(previewData.context.response_number),
      },
    } : undefined,
  } : {};

  const isConfigValid = (): boolean => {
    switch (type) {
      case 'email':
        const hasRecipient = !!(config.to || config.recipient);
        const hasSubject = !!config.subject;
        const hasCustomKeyIfNeeded = config.useCustomApiKey 
          ? (apiKeySaved || !!customApiKey || !!pendingSecret) 
          : true;
        return hasRecipient && hasSubject && hasCustomKeyIfNeeded;
      case 'slack':
        return hasExistingSecret || !!pendingSecret || !!config.webhookUrl;
      case 'webhook':
        return !!config.url;
      case 'zapier':
        return hasExistingSecret || !!pendingSecret || !!config.webhookUrl;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Configuration Section */}
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} id="action-form" className="space-y-6">
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

            {/* Trigger Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
              <Label className="text-muted-foreground">Trigger:</Label>
              <span>On form completed</span>
            </div>

            <div className="border-t border-border/50 pt-6">
              {type === 'email' && (
                <EmailConfiguration
                  config={config}
                  onChange={setConfig}
                  variables={previewData?.availableVariables || []}
                  onInsertVariable={insertVariable}
                  subjectRef={subjectInputRef}
                  bodyRef={bodyTextareaRef}
                  isLoadingVariables={isLoadingPreview}
                  customApiKey={customApiKey}
                  onCustomApiKeyChange={setCustomApiKey}
                  apiKeySaved={apiKeySaved}
                />
              )}

              {type === 'slack' && (
                <SlackConfig
                  config={config}
                  onChange={setConfig}
                  variables={previewData?.availableVariables || []}
                  onSecretChange={setPendingSecret}
                  hasExistingSecret={hasExistingSecret}
                  secretField={integrationInfo?.secretField}
                />
              )}

              {type === 'webhook' && (
                <WebhookConfig config={config} onChange={setConfig} />
              )}

              {type === 'zapier' && (
                <ZapierConfig 
                  config={config} 
                  onChange={setConfig}
                  onSecretChange={setPendingSecret}
                  hasExistingSecret={hasExistingSecret}
                  secretField={integrationInfo?.secretField}
                />
              )}
            </div>
          </form>
        </GlassCard>

        {/* Preview Section */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">Preview</h3>
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

      {/* Footer Actions */}
      <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-background/95 backdrop-blur-sm flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="action-form"
          disabled={isSaving || !name || !isConfigValid()}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isSaving ? 'Saving...' : (action ? 'Save Changes' : 'Create Action')}
        </Button>
      </div>
    </div>
  );
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
  customApiKey,
  onCustomApiKeyChange,
  apiKeySaved,
}: any) => {
  const [showCcBcc, setShowCcBcc] = useState(!!(config.cc || config.bcc));
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKeySaved);
  
  return (
    <div className="space-y-6">
      {/* Provider Choice */}
      <div className="space-y-3">
        <Label>Email Provider</Label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              checked={!config.useCustomApiKey}
              onChange={() => onChange({ ...config, useCustomApiKey: false })}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Use Fairform Email</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Emails sent from action@fairform.io
              </div>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              checked={config.useCustomApiKey}
              onChange={() => {
                onChange({ ...config, useCustomApiKey: true });
                if (!apiKeySaved) setShowApiKeyInput(true);
              }}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Use your own Resend API key</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Send from your own domain
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Custom API Key Fields */}
      {config.useCustomApiKey && (
        <div className="space-y-4 pl-4 border-l-2 border-border/50">
          {apiKeySaved && !showApiKeyInput ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">API key saved</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(true)}
                className="text-xs"
              >
                Change API key
              </Button>
            </div>
          ) : (
            <div>
              <Label htmlFor="customApiKey">Resend API Key *</Label>
              <Input
                id="customApiKey"
                type="text"
                placeholder="re_xxxxxxxxxxxxx"
                value={customApiKey}
                onChange={(e) => onCustomApiKeyChange(e.target.value)}
                className="mt-1.5 font-mono text-sm"
                required={config.useCustomApiKey}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">resend.com/api-keys</a>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                placeholder="Your Company"
                value={config.fromName || ''}
                onChange={(e) => onChange({ ...config, fromName: e.target.value })}
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="fromEmail">From Email *</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="notifications@yourdomain.com"
                value={config.fromEmail || ''}
                onChange={(e) => onChange({ ...config, fromEmail: e.target.value })}
                className="mt-1.5"
                required={config.useCustomApiKey}
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            From email must be a verified domain in your Resend account
          </p>
        </div>
      )}

      {/* Recipients */}
      <div>
        <Label htmlFor="to">Send to *</Label>
        <Input
          id="to"
          type="text"
          placeholder="team@company.com, manager@company.com"
          value={config.to || config.recipient || ''}
          onChange={(e) => onChange({ ...config, to: e.target.value, recipient: undefined })}
          className="mt-1.5"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter multiple email addresses separated by commas
        </p>
      </div>

      {/* CC/BCC Toggle */}
      {!showCcBcc && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCcBcc(true)}
          className="text-xs"
        >
          + Add CC/BCC
        </Button>
      )}

      {/* CC/BCC Fields */}
      {showCcBcc && (
        <div className="space-y-4 pl-4 border-l-2 border-border/50">
          <div>
            <Label htmlFor="cc">CC (Optional)</Label>
            <Input
              id="cc"
              type="text"
              placeholder="cc1@company.com, cc2@company.com"
              value={config.cc || ''}
              onChange={(e) => onChange({ ...config, cc: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="bcc">BCC (Optional)</Label>
            <Input
              id="bcc"
              type="text"
              placeholder="bcc1@company.com, bcc2@company.com"
              value={config.bcc || ''}
              onChange={(e) => onChange({ ...config, bcc: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>
      )}

      {/* Subject */}
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

      {/* Body */}
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
