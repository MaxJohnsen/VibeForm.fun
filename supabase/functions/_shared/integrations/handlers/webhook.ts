import type { IntegrationHandler, HandlerResult } from '../types.ts';

export const webhookHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, form, response, questions, answers, templateContext } = ctx;
  const config = integration.config;

  console.log('Processing webhook integration:', integration.name);

  const webhookUrl = config.url;
  if (!webhookUrl) {
    throw new Error('Webhook URL not configured');
  }

  const method = config.method || 'POST';
  
  // Parse custom headers
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (config.headers) {
    try {
      const customHeaders = typeof config.headers === 'string' 
        ? JSON.parse(config.headers) 
        : config.headers;
      headers = { ...headers, ...customHeaders };
    } catch (e) {
      console.warn('Failed to parse custom headers:', e);
    }
  }

  // Normalize skipped answers to null for clean API consumption
  const normalizeAnswer = (value: unknown): unknown => {
    if (value && typeof value === 'object' && (value as Record<string, unknown>)._skipped === true) {
      return null;
    }
    return value;
  };

  // Build payload with snake_case keys (consistent with actual output)
  const payload = {
    form_id: form.id,
    form_title: form.title,
    form_slug: form.slug,
    response_id: response.id,
    completed_at: response.completed_at,
    answers: answers.map((a) => {
      const question = questions.find((q) => q.id === a.question_id);
      return {
        question_id: a.question_id,
        question_label: question?.label || 'Unknown',
        question_type: question?.type || 'unknown',
        answer: normalizeAnswer(a.answer_value),
      };
    }),
    _meta: {
      is_test: ctx.isTest || false,
      submitted_at: templateContext.submitted_at,
      response_number: templateContext.response_number,
    },
  };

  console.log(`Sending ${method} request to:`, webhookUrl);
  console.log('Webhook payload:', JSON.stringify(payload, null, 2));

  // Build fetch options - don't include body for GET requests
  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (method !== 'GET') {
    fetchOptions.body = JSON.stringify(payload);
  }

  const webhookResponse = await fetch(webhookUrl, fetchOptions);

  if (!webhookResponse.ok) {
    const errorText = await webhookResponse.text();
    throw new Error(`Webhook error (${webhookResponse.status}): ${errorText}`);
  }

  const responseText = await webhookResponse.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = responseText;
  }

  console.log('Webhook sent successfully, status:', webhookResponse.status);

  return {
    success: true,
    data: responseData,
  };
};
