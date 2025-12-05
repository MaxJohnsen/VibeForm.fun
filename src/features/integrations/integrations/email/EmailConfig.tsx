import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VariablePicker } from '../../components/VariablePicker';
import { IntegrationConfigProps } from '../../types/integrationDefinition';

export const EmailConfig = ({
  config,
  onChange,
  variables = [],
  subjectRef,
  bodyRef,
  onInsertVariable,
  isLoadingVariables,
  customApiKey,
  onCustomApiKeyChange,
  apiKeySaved,
  disabled,
}: IntegrationConfigProps) => {
  const [showCcBcc, setShowCcBcc] = useState(!!(config.cc || config.bcc));
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKeySaved);
  
  return (
    <div className="space-y-6">
      {/* Provider Choice */}
      <div className="space-y-3">
        <Label>Email Provider</Label>
        <div className="space-y-2">
          <label className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="radio"
              checked={!config.useCustomApiKey}
              onChange={() => onChange({ ...config, useCustomApiKey: false })}
              className="mt-0.5"
              disabled={disabled}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">Use Fairform Email</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Emails sent from action@fairform.io
              </div>
            </div>
          </label>
          
          <label className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="radio"
              checked={config.useCustomApiKey}
              onChange={() => {
                onChange({ ...config, useCustomApiKey: true });
                if (!apiKeySaved) setShowApiKeyInput(true);
              }}
              className="mt-0.5"
              disabled={disabled}
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
                disabled={disabled}
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
                value={customApiKey || ''}
                onChange={(e) => onCustomApiKeyChange?.(e.target.value)}
                className="mt-1.5 font-mono text-sm"
                required={config.useCustomApiKey}
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
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
              disabled={disabled}
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
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Subject */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="subject">Email Subject *</Label>
          {!isLoadingVariables && variables.length > 0 && (
            <VariablePicker
              variables={variables}
              onSelect={(v) => onInsertVariable?.('subject', v)}
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
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {`{{variable}}`} syntax to insert dynamic content
        </p>
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="bodyTemplate">Email Body</Label>
          {!isLoadingVariables && variables.length > 0 && (
            <VariablePicker
              variables={variables}
              onSelect={(v) => onInsertVariable?.('body', v)}
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
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Default template includes all answers formatted
        </p>
      </div>
    </div>
  );
};
