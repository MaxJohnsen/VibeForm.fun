import { IntegrationType } from '../api/integrationsApi';
import { IntegrationDefinition } from '../types/integrationDefinition';
import { emailDefinition } from './email/definition';
import { slackDefinition } from './slack/definition';
import { webhookDefinition } from './webhook/definition';
import { zapierDefinition } from './zapier/definition';

/**
 * Central registry of all integration definitions
 */
export const INTEGRATION_REGISTRY: Record<IntegrationType, IntegrationDefinition> = {
  email: emailDefinition,
  slack: slackDefinition,
  webhook: webhookDefinition,
  zapier: zapierDefinition,
};

/**
 * Get all integrations as an array (useful for rendering palettes)
 */
export const getAllIntegrations = (): IntegrationDefinition[] => 
  Object.values(INTEGRATION_REGISTRY);

/**
 * Get a specific integration definition by type
 */
export const getIntegration = (type: IntegrationType): IntegrationDefinition => 
  INTEGRATION_REGISTRY[type];

/**
 * Check if an integration type exists
 */
export const hasIntegration = (type: string): type is IntegrationType =>
  type in INTEGRATION_REGISTRY;
