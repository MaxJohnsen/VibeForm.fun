import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type IntegrationType = 'email' | 'slack' | 'webhook' | 'zapier';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  config: Record<string, any>;
}

export interface HandlerContext {
  integration: Integration;
  response: any;
  questions: any[];
  supabase: SupabaseClient;
}

export interface HandlerResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type IntegrationHandler = (ctx: HandlerContext) => Promise<HandlerResult>;
