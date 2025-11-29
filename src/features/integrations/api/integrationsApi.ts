import { supabase } from '@/integrations/supabase/client';

export type IntegrationType = 'email' | 'slack' | 'webhook' | 'zapier';
export type IntegrationTrigger = 'form_completed' | 'form_started' | 'question_answered';
export type IntegrationStatus = 'success' | 'error' | 'pending';

export interface Integration {
  id: string;
  form_id: string;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  trigger: IntegrationTrigger;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  response_id: string;
  status: IntegrationStatus;
  payload?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  executed_at: string;
}

export interface EmailConfig {
  // Provider choice
  useCustomApiKey: boolean;
  customApiKey?: string;
  
  // Sender (when using custom API key)
  fromName?: string;
  fromEmail?: string;
  
  // Recipients
  to: string;  // Comma-separated emails
  cc?: string;  // Comma-separated CC emails
  bcc?: string;  // Comma-separated BCC emails
  
  // Content
  subject: string;
  bodyTemplate?: string;
  
  // Legacy support
  recipient?: string;  // Backward compatibility
}

export interface SlackConfig {
  webhookUrl: string;
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
}

export interface ZapierConfig {
  webhookUrl: string;
}

export const fetchIntegrations = async (formId: string) => {
  const { data, error } = await supabase
    .from('form_integrations')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Integration[];
};

export const createIntegration = async (integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('form_integrations')
    .insert(integration)
    .select()
    .single();

  if (error) throw error;
  return data as Integration;
};

export const updateIntegration = async (id: string, updates: Partial<Integration>) => {
  const { data, error } = await supabase
    .from('form_integrations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Integration;
};

export const deleteIntegration = async (id: string) => {
  const { error } = await supabase
    .from('form_integrations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const testIntegration = async (integrationId: string) => {
  const { data, error } = await supabase.functions.invoke('test-integration', {
    body: { integrationId },
  });

  if (error) throw error;
  return data;
};

export const fetchIntegrationLogs = async (integrationId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('integration_logs')
    .select('*')
    .eq('integration_id', integrationId)
    .order('executed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as IntegrationLog[];
};
