import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { buildTemplateContext, processTemplate } from '../_shared/templateEngine.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Integration {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'zapier';
  name: string;
  config: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId, responseId } = await req.json();
    console.log('Processing integrations for form:', formId, 'response:', responseId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch enabled integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('form_integrations')
      .select('*')
      .eq('form_id', formId)
      .eq('enabled', true)
      .eq('trigger', 'form_completed');

    if (integrationsError) throw integrationsError;
    if (!integrations || integrations.length === 0) {
      console.log('No enabled integrations found');
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch complete response data with answers
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*, answers(*), forms(title, slug)')
      .eq('id', responseId)
      .single();

    if (responseError) throw responseError;

    // Fetch all questions for the form
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position');

    if (questionsError) throw questionsError;

    // Process each integration
    const results = await Promise.allSettled(
      integrations.map((integration: Integration) =>
        processIntegration(integration, response, questions, supabase)
      )
    );

    console.log(`Processed ${results.length} integrations`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results.map((r) => (r.status === 'fulfilled' ? 'success' : 'error')),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in process-integrations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processIntegration(
  integration: Integration,
  response: any,
  questions: any[],
  supabase: any
) {
  const startTime = Date.now();
  let status: 'success' | 'error' = 'success';
  let errorMessage: string | undefined;
  let responseData: any = null;

  try {
    console.log(`Processing ${integration.type} integration: ${integration.name}`);

    switch (integration.type) {
      case 'email':
        responseData = await processEmailIntegration(integration, response, questions);
        break;
      case 'slack':
        responseData = await processSlackIntegration(integration, response, questions);
        break;
      case 'webhook':
        responseData = await processWebhookIntegration(integration, response, questions);
        break;
      case 'zapier':
        responseData = await processZapierIntegration(integration, response, questions);
        break;
      default:
        throw new Error(`Unknown integration type: ${integration.type}`);
    }
  } catch (error: any) {
    status = 'error';
    errorMessage = error.message;
    console.error(`Error processing ${integration.type}:`, error);
  }

  // Log the integration execution
  await supabase.from('integration_logs').insert({
    integration_id: integration.id,
    response_id: response.id,
    status,
    payload: { response, questions },
    response_data: responseData,
    error_message: errorMessage,
  });

  console.log(`Integration ${integration.name} completed in ${Date.now() - startTime}ms`);
}

async function processEmailIntegration(integration: Integration, response: any, questions: any[]) {
  const config = integration.config;
  
  // Determine which API key to use
  const resendApiKey = config.useCustomApiKey && config.customApiKey
    ? config.customApiKey
    : Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const resend = new Resend(resendApiKey);

  // Build template context
  const context = buildTemplateContext(
    response.forms,
    response,
    questions,
    response.answers || []
  );

  // Process templates
  const subject = config.subject 
    ? processTemplate(config.subject, context)
    : `New response for ${response.forms?.title}`;

  const body = config.bodyTemplate
    ? processTemplate(config.bodyTemplate, context)
    : context.all_answers;

  // Parse email addresses (comma-separated to array)
  const parseEmails = (input: string): string[] => {
    if (!input) return [];
    return input.split(',').map(e => e.trim()).filter(Boolean);
  };

  // Determine from address
  const fromAddress = config.useCustomApiKey && config.fromEmail
    ? `${config.fromName || 'Forms'} <${config.fromEmail}>`
    : 'Fairform <action@fairform.io>';

  // Support both new 'to' and legacy 'recipient' fields
  const toEmails = parseEmails(config.to || config.recipient || '');
  
  if (toEmails.length === 0) {
    throw new Error('No recipient email addresses specified');
  }

  const emailResponse = await resend.emails.send({
    from: fromAddress,
    to: toEmails,
    cc: parseEmails(config.cc || ''),
    bcc: parseEmails(config.bcc || ''),
    subject,
    html: `
      <h2>New Form Response</h2>
      <p><strong>Form:</strong> ${response.forms?.title}</p>
      <p><strong>Submitted:</strong> ${new Date(response.completed_at).toLocaleString()}</p>
      <hr/>
      <pre style="white-space: pre-wrap; font-family: sans-serif;">${body}</pre>
    `,
  });

  return emailResponse;
}

async function processSlackIntegration(integration: Integration, response: any, questions: any[]) {
  const config = integration.config;

  // Build template context
  const context = buildTemplateContext(
    response.forms,
    response,
    questions,
    response.answers || []
  );

  let slackPayload: any;
  
  // Check if custom message template is provided
  if (config.message && config.message.trim()) {
    // Use custom message template
    const processedMessage = processTemplate(config.message, context);
    
    slackPayload = {
      text: processedMessage,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: processedMessage
          }
        }
      ]
    };
  } else {
    // Use default format with fields
    const answersMap = new Map();
    response.answers?.forEach((answer: any) => {
      const question = questions.find((q) => q.id === answer.question_id);
      if (question) {
        answersMap.set(question.label, formatAnswerValue(answer.answer_value));
      }
    });

    const fields = Array.from(answersMap.entries()).map(([label, value]) => ({
      type: 'mrkdwn',
      text: `*${label}*\n${value}`,
    }));

    // Slack has a 10-field limit per section, so we need to chunk
    const fieldChunks: any[][] = [];
    for (let i = 0; i < fields.length; i += 10) {
      fieldChunks.push(fields.slice(i, i + 10));
    }

    // Build blocks with chunked sections
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎉 New Response: ${response.forms?.title}`,
        },
      },
    ];

    // Add a section block for each chunk
    fieldChunks.forEach((chunk) => {
      blocks.push({
        type: 'section',
        fields: chunk,
      });
    });

    // Add timestamp context
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Submitted at ${new Date(response.completed_at).toLocaleString()}`,
        },
      ],
    });

    slackPayload = { blocks };
  }

  const slackResponse = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
  });

  if (!slackResponse.ok) {
    throw new Error(`Slack API error: ${slackResponse.statusText}`);
  }

  return { status: slackResponse.status };
}

async function processWebhookIntegration(integration: Integration, response: any, questions: any[]) {
  const config = integration.config;

  const payload = {
    formId: response.form_id,
    responseId: response.id,
    formTitle: response.forms?.title,
    completedAt: response.completed_at,
    answers: response.answers,
    questions,
  };

  const webhookResponse = await fetch(config.url, {
    method: config.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    body: JSON.stringify(payload),
  });

  if (!webhookResponse.ok) {
    throw new Error(`Webhook error: ${webhookResponse.statusText}`);
  }

  return {
    status: webhookResponse.status,
    body: await webhookResponse.text(),
  };
}

async function processZapierIntegration(integration: Integration, response: any, questions: any[]) {
  // Zapier is essentially a webhook with a friendly name
  return processWebhookIntegration(
    { ...integration, config: { url: integration.config.webhookUrl, method: 'POST' } },
    response,
    questions
  );
}

function formatAnswerValue(value: any): string {
  if (value === null || value === undefined) return 'No answer';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}
