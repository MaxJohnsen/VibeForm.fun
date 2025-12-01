import type { IntegrationHandler, HandlerResult, HandlerContext } from '../types.ts';
import { fetchAndDecryptSecret } from '../utils.ts';
import { webhookHandler } from './webhook.ts';

export const zapierHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, supabase } = ctx;

  console.log('Processing Zapier integration:', integration.name);

  // Fetch and decrypt Zapier webhook URL
  const webhookUrl = await fetchAndDecryptSecret(supabase, integration.id, 'zapier_webhook');

  // Create a modified context with the webhook URL in config
  const modifiedCtx: HandlerContext = {
    ...ctx,
    integration: {
      ...integration,
      config: {
        ...integration.config,
        url: webhookUrl,
        method: 'POST',
      },
    },
  };

  // Delegate to webhook handler
  return webhookHandler(modifiedCtx);
};
