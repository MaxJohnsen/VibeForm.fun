import { LucideIcon } from 'lucide-react';
import { IntegrationType } from '../api/integrationsApi';
import { TemplateVariable } from '../hooks/useTemplatePreview';

/**
 * Configuration for secrets that need to be stored securely
 */
export interface SecretFieldConfig {
  key: string; // Key type for integration_secrets table
  configPath?: string; // Path in config object (if secret replaces config field)
  label: string;
  placeholder: string;
  helpUrl?: string;
}

/**
 * Props passed to integration config components
 */
export interface IntegrationConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  variables?: TemplateVariable[];
  onSecretChange?: (value: string) => void;
  hasExistingSecret?: boolean;
  // Email-specific props (optional)
  subjectRef?: React.RefObject<HTMLInputElement>;
  bodyRef?: React.RefObject<HTMLTextAreaElement>;
  onInsertVariable?: (field: 'subject' | 'body', variable: string) => void;
  isLoadingVariables?: boolean;
  customApiKey?: string;
  onCustomApiKeyChange?: (value: string) => void;
  apiKeySaved?: boolean;
}

/**
 * Props passed to integration preview components
 */
export interface IntegrationPreviewProps {
  config: Record<string, any>;
  processedContent: {
    subject?: string;
    body?: string;
    to?: string;
    cc?: string;
    bcc?: string;
    fromName?: string;
    fromEmail?: string;
    useCustomApiKey?: boolean;
    payload?: any;
  };
}

/**
 * Context for building processed preview content
 */
export interface PreviewBuildContext {
  formId: string;
  form: { title: string; slug?: string };
  processTemplate: (template: string) => string;
  context: Record<string, any>;
  questions: Array<{ id: string; label: string; type: string }>;
  sampleAnswers: Array<{ question_id: string; answer_value: any }>;
}

/**
 * Context for validation
 */
export interface ValidationContext {
  hasExistingSecret: boolean;
  pendingSecret: string;
  customApiKey?: string;
  apiKeySaved?: boolean;
}

/**
 * Definition for a single integration type
 */
export interface IntegrationDefinition {
  type: IntegrationType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  secretField?: SecretFieldConfig;
  
  // Components
  ConfigComponent: React.ComponentType<IntegrationConfigProps>;
  PreviewComponent: React.ComponentType<IntegrationPreviewProps>;
  
  // Logic
  getDefaultConfig: () => Record<string, any>;
  validateConfig: (config: Record<string, any>, context: ValidationContext) => boolean;
  buildProcessedContent: (config: Record<string, any>, context: PreviewBuildContext) => IntegrationPreviewProps['processedContent'];
}
