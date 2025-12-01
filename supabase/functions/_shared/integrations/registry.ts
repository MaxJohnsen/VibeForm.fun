import type { IntegrationType, IntegrationHandler } from './types.ts';
import { emailHandler } from './handlers/email.ts';
import { slackHandler } from './handlers/slack.ts';
import { webhookHandler } from './handlers/webhook.ts';
import { zapierHandler } from './handlers/zapier.ts';

const handlers: Record<IntegrationType, IntegrationHandler> = {
  email: emailHandler,
  slack: slackHandler,
  webhook: webhookHandler,
  zapier: zapierHandler,
};

export function getHandler(type: IntegrationType): IntegrationHandler {
  const handler = handlers[type];
  if (!handler) {
    throw new Error(`Unknown integration type: ${type}`);
  }
  return handler;
}

export function hasHandler(type: string): type is IntegrationType {
  return type in handlers;
}
