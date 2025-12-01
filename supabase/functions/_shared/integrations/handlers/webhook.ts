import type { IntegrationHandler, HandlerResult } from '../types.ts';

export const webhookHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, response, questions } = ctx;
  const config = integration.config;

  console.log('Processing webhook integration:', integration.name);

  const webhookUrl = config.url;
  if (!webhookUrl) {
    throw new Error('Webhook URL not configured');
  }

  // Build payload
  const payload = {
    form_id: response.form_id,
    response_id: response.id,
    form_title: response.forms?.title,
    completed_at: response.completed_at,
    answers: response.answers?.map((answer: any) => {
      const question = questions.find((q) => q.id === answer.question_id);
      return {
        question_id: answer.question_id,
        question_label: question?.label,
        question_type: question?.type,
        answer_value: answer.answer_value,
      };
    }),
  };

  // Configure request
  const method = config.method || 'POST';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };

  console.log(`Sending webhook ${method} to:`, webhookUrl);

  const webhookResponse = await fetch(webhookUrl, {
    method,
    headers,
    body: JSON.stringify(payload),
  });

  if (!webhookResponse.ok) {
    const errorText = await webhookResponse.text();
    throw new Error(`Webhook error (${webhookResponse.status}): ${errorText}`);
  }

  const responseData = await webhookResponse.json().catch(() => ({}));
  console.log('Webhook sent successfully');

  return {
    success: true,
    data: responseData,
  };
};
