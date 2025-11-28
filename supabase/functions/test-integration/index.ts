import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integrationId } = await req.json();
    console.log('Testing integration:', integrationId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the integration
    const { data: integration, error: integrationError } = await supabase
      .from('form_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (integrationError) throw integrationError;

    // Create mock test data
    const mockResponse = {
      id: 'test-response-id',
      form_id: integration.form_id,
      completed_at: new Date().toISOString(),
      forms: {
        title: 'Test Form',
        slug: 'test-form',
      },
      answers: [
        {
          question_id: 'test-q1',
          answer_value: 'Test Answer 1',
        },
        {
          question_id: 'test-q2',
          answer_value: 'Test Answer 2',
        },
      ],
    };

    const mockQuestions = [
      {
        id: 'test-q1',
        label: 'Test Question 1',
        type: 'short_text',
      },
      {
        id: 'test-q2',
        label: 'Test Question 2',
        type: 'long_text',
      },
    ];

    let result;
    let success = false;

    switch (integration.type) {
      case 'email':
        result = await testEmail(integration.config);
        success = !!result;
        break;
      case 'slack':
        result = await testSlack(integration.config, mockResponse);
        success = result.ok;
        break;
      case 'webhook':
      case 'zapier':
        result = await testWebhook(integration.config, mockResponse, mockQuestions);
        success = result.ok;
        break;
      default:
        throw new Error(`Unknown integration type: ${integration.type}`);
    }

    // Log the test
    await supabase.from('integration_logs').insert({
      integration_id: integrationId,
      response_id: 'test',
      status: success ? 'success' : 'error',
      payload: { test: true, mockResponse, mockQuestions },
      response_data: result,
    });

    return new Response(
      JSON.stringify({
        success,
        message: success ? 'Test successful' : 'Test failed',
        result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in test-integration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function testEmail(config: any) {
  // For email, we just validate the config without sending
  if (!config.recipient || !config.subject) {
    throw new Error('Invalid email configuration');
  }
  return { validated: true, recipient: config.recipient };
}

async function testSlack(config: any, mockResponse: any) {
  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🧪 Test message from integration: New response for "${mockResponse.forms.title}"`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Test Integration*\nThis is a test message to verify your Slack integration is working correctly.',
          },
        },
      ],
    }),
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
}

async function testWebhook(config: any, mockResponse: any, mockQuestions: any[]) {
  const url = config.url || config.webhookUrl;
  const response = await fetch(url, {
    method: config.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    body: JSON.stringify({
      test: true,
      formId: mockResponse.form_id,
      formTitle: mockResponse.forms.title,
      completedAt: mockResponse.completed_at,
      answers: mockResponse.answers,
      questions: mockQuestions,
    }),
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
}
