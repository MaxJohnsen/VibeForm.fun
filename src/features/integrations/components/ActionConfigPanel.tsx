import { useState, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlassCard } from '@/shared/ui/GlassCard';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { SecretInput } from '@/shared/ui';
import { VariablePicker } from './VariablePicker';
import { ActionPreview } from './ActionPreview';
import { useTemplatePreview } from '../hooks/useTemplatePreview';
import { getAvailableVariables } from '@/shared/utils/templateEngine';
import { Integration, IntegrationType, saveIntegrationSecret, updateIntegrationSecret, deleteIntegrationSecret } from '../api/integrationsApi';
import { INTEGRATION_TYPES } from '../constants/integrationTypes';
import { SlackConfig } from './config/SlackConfig';
import { WebhookConfig } from './config/WebhookConfig';
import { ZapierConfig } from './config/ZapierConfig';

interface ActionConfigPanelProps {
  formId: string;
  type: IntegrationType;
  action?: Integration;
  onSave: (data: Omit<Integration, 'id' | 'created_at' | 'updated_at'>) => Promise<Integration>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For existing actions, just update normally
    if (action) {
      await onSave({
        form_id: formId,
        type,
        name,
        config,
        enabled: action.enabled,
        trigger: action.trigger,
      });
      return;
    }
    
    // For new actions: save with pending secrets first
    const pendingSecrets = extractPendingSecrets(config, type);
    const cleanConfig = removePlaintextSecrets(config, type);
    
    // Step 1: Create integration
    const integration = await onSave({
      form_id: formId,
      type,
      name,
      config: cleanConfig,
      enabled: true,
      trigger: 'form_completed',
    });
    
    // Step 2: Save pending secrets to vault
    if (pendingSecrets.length > 0) {
      const secretIds: Record<string, string> = {};
      
      for (const secret of pendingSecrets) {
        try {
          const secretId = await saveIntegrationSecret(
            integration.id,
            secret.value,
            secret.name
          );
          secretIds[secret.field] = secretId;
        } catch (error) {
          console.error(`Failed to save secret ${secret.name}:`, error);
        }
      }
      
      // Step 3: Update config with secret IDs
      if (Object.keys(secretIds).length > 0) {
        const finalConfig = { ...cleanConfig, ...secretIds };
        // Update the integration config with secret IDs
        await updateIntegrationSecret(integration.id, integration.id, JSON.stringify(finalConfig));
      }
    }
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
    to: config.to || config.recipient,
    cc: config.cc,
    bcc: config.bcc,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    useCustomApiKey: config.useCustomApiKey,
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
                        integrationId={action?.id}
                      />
                    )}

                    {type === 'slack' && (
                      <SlackConfig
                        config={config}
                        onChange={setConfig}
                        variables={previewData ? getAvailableVariables(previewData.questions) : []}
                        integrationId={action?.id}
                        isPending={!action}
                      />
                    )}

                    {type === 'webhook' && (
                      <WebhookConfig 
                        config={config} 
                        onChange={setConfig}
                        integrationId={action?.id}
                        isPending={!action}
                      />
                    )}

                    {type === 'zapier' && (
                      <ZapierConfig 
                        config={config} 
                        onChange={setConfig}
                        integrationId={action?.id}
                        isPending={!action}
                      />
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
    const isNewAction = !action;
    
    switch (type) {
      case 'email':
        const hasRecipient = !!(config.to || config.recipient);
        const hasSubject = !!config.subject;
        const hasCustomKeyIfNeeded = config.useCustomApiKey 
          ? (isNewAction 
              ? !!config.customApiKey  // New: check for pending value
              : !!(config.customApiKeySecretId || config.customApiKey)) // Existing: check for secret ID or legacy
          : true;
        return hasRecipient && hasSubject && hasCustomKeyIfNeeded;
      case 'slack':
        return isNewAction 
          ? !!config.webhookUrl  // New: check for pending value
          : !!(config.webhookUrlSecretId || config.webhookUrl); // Existing: check for secret ID or legacy
      case 'webhook':
        return isNewAction 
          ? !!config.url  // New: check for pending value
          : !!(config.urlSecretId || config.url); // Existing: check for secret ID or legacy
      case 'zapier':
        return isNewAction 
          ? !!config.webhookUrl  // New: check for pending value
          : !!(config.webhookUrlSecretId || config.webhookUrl); // Existing: check for secret ID or legacy
      default:
        return false;
    }
  }
};

// Helper functions for managing pending secrets
function extractPendingSecrets(config: Record<string, any>, type: IntegrationType): Array<{ field: string; name: string; value: string }> {
  const secrets: Array<{ field: string; name: string; value: string }> = [];
  
  switch (type) {
    case 'email':
      if (config.useCustomApiKey && config.customApiKey && !config.customApiKeySecretId) {
        secrets.push({
          field: 'customApiKeySecretId',
          name: 'resend_api_key',
          value: config.customApiKey,
        });
      }
      break;
    case 'slack':
      if (config.webhookUrl && !config.webhookUrlSecretId) {
        secrets.push({
          field: 'webhookUrlSecretId',
          name: 'slack_webhook_url',
          value: config.webhookUrl,
        });
      }
      break;
    case 'webhook':
      if (config.url && !config.urlSecretId) {
        secrets.push({
          field: 'urlSecretId',
          name: 'webhook_url',
          value: config.url,
        });
      }
      break;
    case 'zapier':
      if (config.webhookUrl && !config.webhookUrlSecretId) {
        secrets.push({
          field: 'webhookUrlSecretId',
          name: 'zapier_webhook_url',
          value: config.webhookUrl,
        });
      }
      break;
  }
  
  return secrets;
}

function removePlaintextSecrets(config: Record<string, any>, type: IntegrationType): Record<string, any> {
  const cleaned = { ...config };
  
  switch (type) {
    case 'email':
      if (cleaned.customApiKey && !cleaned.customApiKeySecretId) {
        delete cleaned.customApiKey;
      }
      break;
    case 'slack':
      if (cleaned.webhookUrl && !cleaned.webhookUrlSecretId) {
        delete cleaned.webhookUrl;
      }
      break;
    case 'webhook':
      if (cleaned.url && !cleaned.urlSecretId) {
        delete cleaned.url;
      }
      break;
    case 'zapier':
      if (cleaned.webhookUrl && !cleaned.webhookUrlSecretId) {
        delete cleaned.webhookUrl;
      }
      break;
  }
  
  return cleaned;
}

// Email-specific configuration component
const EmailConfiguration = ({
  config,
  onChange,
  variables,
  onInsertVariable,
  subjectRef,
  bodyRef,
  isLoadingVariables,
  integrationId,
}: any) => {
  const [showCcBcc, setShowCcBcc] = useState(!!(config.cc || config.bcc));

  const handleSaveApiKey = async (value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    const secretId = await saveIntegrationSecret(integrationId, value, 'resend_api_key');
    return secretId;
  };

  const handleUpdateApiKey = async (secretId: string, value: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    await updateIntegrationSecret(integrationId, secretId, value);
  };

  const handleDeleteApiKey = async (secretId: string) => {
    if (!integrationId) throw new Error('Integration ID required');
    await deleteIntegrationSecret(integrationId, secretId);
  };
  
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
              onChange={() => onChange({ ...config, useCustomApiKey: true })}
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
          <SecretInput
            label="Resend API Key *"
            value={config.customApiKey}
            secretId={config.customApiKeySecretId}
            onChange={(value, secretId) => {
              onChange({
                ...config,
                customApiKey: value,
                customApiKeySecretId: secretId,
              });
            }}
            onSave={handleSaveApiKey}
            onUpdate={handleUpdateApiKey}
            onDelete={handleDeleteApiKey}
            placeholder="re_xxxxxxxxxxxxx"
            description="Get your API key at resend.com/api-keys"
            isPending={!integrationId}
          />

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
