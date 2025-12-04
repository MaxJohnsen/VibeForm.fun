import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/shared/ui/GlassCard';
import { ActionPreview } from './ActionPreview';
import { useTemplatePreview } from '../hooks/useTemplatePreview';
import { Integration, IntegrationType } from '../api/integrationsApi';
import { getIntegration } from '../integrations';
import { insertVariableAtCursor, focusAndSetCursor } from '../utils/insertVariable';

interface ActionConfigFormProps {
  formId: string;
  type: IntegrationType;
  action?: Integration;
  onSave: (data: Omit<Integration, 'id' | 'created_at' | 'updated_at'> & { _pendingSecret?: string }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ActionConfigForm = ({
  formId,
  type,
  action,
  onSave,
  onCancel,
  isSaving,
}: ActionConfigFormProps) => {
  const integration = getIntegration(type);
  const [name, setName] = useState(action?.name || `${integration.label} notification`);
  const [config, setConfig] = useState<Record<string, any>>(action?.config || integration.getDefaultConfig());
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: previewData, isLoading: isLoadingPreview } = useTemplatePreview(formId);
  
  const [pendingSecret, setPendingSecret] = useState<string>('');
  const hasExistingSecret = !!action?.id && !!integration.secretField;
  
  // Email-specific state
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(!!action?.id && !!action?.config?.useCustomApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const safeConfig = { ...config };
    
    // Remove secret fields from config (they go to secure storage)
    if (integration.secretField?.configPath) {
      delete safeConfig[integration.secretField.configPath];
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
    
    // Email-specific: handle custom API key
    if (customApiKey && config.useCustomApiKey) {
      integrationData._pendingSecret = customApiKey;
    }
    
    onSave(integrationData);
  };

  const insertVariable = (field: 'subject' | 'body', variable: string) => {
    if (field === 'subject' && subjectInputRef.current) {
      const { newValue, cursorPosition } = insertVariableAtCursor(
        subjectInputRef.current,
        config.subject || '',
        variable
      );
      setConfig({ ...config, subject: newValue });
      focusAndSetCursor(subjectInputRef.current, cursorPosition);
    } else if (field === 'body' && bodyTextareaRef.current) {
      const { newValue, cursorPosition } = insertVariableAtCursor(
        bodyTextareaRef.current,
        config.bodyTemplate || '',
        variable
      );
      setConfig({ ...config, bodyTemplate: newValue });
      focusAndSetCursor(bodyTextareaRef.current, cursorPosition);
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
    return integration.validateConfig(config, {
      hasExistingSecret,
      pendingSecret,
      customApiKey,
      apiKeySaved,
    });
  };

  const ConfigComponent = integration.ConfigComponent;

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
              <ConfigComponent
                config={config}
                onChange={setConfig}
                variables={previewData?.availableVariables || []}
                onSecretChange={setPendingSecret}
                hasExistingSecret={hasExistingSecret}
                // Email-specific props
                subjectRef={subjectInputRef}
                bodyRef={bodyTextareaRef}
                onInsertVariable={insertVariable}
                isLoadingVariables={isLoadingPreview}
                customApiKey={customApiKey}
                onCustomApiKeyChange={setCustomApiKey}
                apiKeySaved={apiKeySaved}
              />
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
