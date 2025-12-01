import type { IntegrationHandler, HandlerResult } from '../types.ts';
import { buildTemplateContext, processTemplate } from '../../templateEngine.ts';
import { fetchAndDecryptSecret, formatAnswerValue } from '../utils.ts';

export const slackHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, response, questions, supabase } = ctx;
  const config = integration.config;

  console.log('Processing Slack integration:', integration.name);

  // Fetch and decrypt webhook URL
  const webhookUrl = await fetchAndDecryptSecret(supabase, integration.id, 'slack_webhook');

  // Build template context
  const form = response.form;
  const answers = response.answers || [];
  const context = buildTemplateContext(form, response, questions, answers);

  let slackPayload: any;

  if (config.message) {
    // Custom message template
    const message = processTemplate(config.message, context);
    slackPayload = {
      text: message,
    };
  } else {
    // Default formatted message with Block Kit
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 ${form.title}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New response received*\nCompleted: ${new Date(response.completed_at).toLocaleString()}`,
        },
      },
      {
        type: 'divider',
      },
    ];

    // Add each answer as a section
    for (const answer of answers) {
      const question = questions.find((q) => q.id === answer.question_id);
      if (question) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${question.label}*\n${formatAnswerValue(answer.answer_value)}`,
          },
        });
      }
    }

    slackPayload = { blocks };
  }

  console.log('Sending Slack message to webhook');

  const slackResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(slackPayload),
  });

  if (!slackResponse.ok) {
    const errorText = await slackResponse.text();
    throw new Error(`Slack webhook error: ${errorText}`);
  }

  console.log('Slack message sent successfully');

  return {
    success: true,
    data: { status: 'sent' },
  };
};
