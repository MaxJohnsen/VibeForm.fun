import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { TemplateContext } from '../templateEngine.ts';

export type IntegrationType = 'email' | 'slack' | 'webhook' | 'zapier';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  config: Record<string, any>;
}

export interface Form {
  id: string;
  title: string;
  slug: string | null;
}

export interface Question {
  id: string;
  label: string;
  type: string;
  position: number;
  settings?: Record<string, any>;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_value: any;
  answered_at: string;
}

export interface ResponseWithForm {
  id: string;
  form_id: string;
  status: string;
  completed_at: string | null;
  forms: Form;
  answers: Answer[];
}

/**
 * Context passed to all integration handlers
 * Template context is pre-built once by process-integrations
 */
export interface HandlerContext {
  integration: Integration;
  response: ResponseWithForm;
  form: Form;
  questions: Question[];
  answers: Answer[];
  templateContext: TemplateContext;
  supabase: SupabaseClient;
  /** Indicates this is a test execution - handlers can adjust behavior (e.g., add prefix) */
  isTest?: boolean;
}

export interface HandlerResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type IntegrationHandler = (ctx: HandlerContext) => Promise<HandlerResult>;
