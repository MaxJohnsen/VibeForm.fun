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

    if (!integrationId) {
      throw new Error('Integration ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch integration
    const { data: integration, error } = await supabase
      .from('form_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error || !integration) {
      throw new Error('Integration not found');
    }

    // Create mock data for testing
    const mockResponse = {
      id: 'test-response-id',
      form_id: integration.form_id,
      completed_at: new Date().toISOString(),
      forms: {
        title: 'Test Form',
        slug: 'test-form',
      },
    };

    const mockQuestions = [
      {
        id: 'q1',
        label: 'What is your name?',
        type: 'short_text',
      },
      {
        id: 'q2',
        label: 'What is your email?',
        type: 'email',
      },
    ];

    let result;
    switch (integration.type) {
      case 'email':
        result = await testEmail(integration.config);
        break;
      case 'slack':
        result = await testSlack(integration.config, mockResponse, supabase);
        break;
      case 'webhook':
        result = await testWebhook(integration.config, mockResponse, mockQuestions, supabase);
        break;
      case 'zapier':
        result = await testZapier(integration.config, mockResponse, mockQuestions, supabase);
        break;
      default:
        throw new Error(`Unknown integration type: ${integration.type}`);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in test-integration:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper function to decrypt a secret from vault
async function getDecryptedSecret(supabase: any, secretId: string | undefined): Promise<string | undefined> {
  if (!secretId) return undefined;
  
  try {
    const { data, error } = await supabase.rpc('get_decrypted_secret', { secret_id: secretId });
    if (error) {
      console.error('Error decrypting secret:', error);
      return undefined;
    }
    return data;
  } catch (error) {
    console.error('Exception decrypting secret:', error);
    return undefined;
  }
}

async function testEmail(config: any) {
  // For email, we just validate the config without sending
  const hasRecipient = !!(config.to || config.recipient);
  const hasSubject = !!config.subject;
  
  if (!hasRecipient || !hasSubject) {
    throw new Error('Invalid email configuration');
  }
  
  return { validated: true, recipient: config.to || config.recipient };
}

async function testSlack(config: any, mockResponse: any, supabase: any) {
  // Decrypt webhook URL from vault if using secret
  const webhookUrl = config.webhookUrlSecretId
    ? await getDecryptedSecret(supabase, config.webhookUrlSecretId)
    : config.webhookUrl;

  if (!webhookUrl) {
    throw new Error('Slack webhook URL not configured');
  }

  const response = await fetch(webhookUrl, {
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

async function testWebhook(config: any, mockResponse: any, mockQuestions: any[], supabase: any) {
  // Decrypt webhook URL from vault if using secret
  const url = config.urlSecretId
    ? await getDecryptedSecret(supabase, config.urlSecretId)
    : config.url;

  if (!url) {
    throw new Error('Webhook URL not configured');
  }

  const payload = {
    test: true,
    formId: mockResponse.form_id,
    responseId: mockResponse.id,
    formTitle: mockResponse.forms.title,
    completedAt: mockResponse.completed_at,
    questions: mockQuestions,
  };

  const response = await fetch(url, {
    method: config.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  };
}

async function testZapier(config: any, mockResponse: any, mockQuestions: any[], supabase: any) {
  // Decrypt webhook URL from vault if using secret
  const webhookUrl = config.webhookUrlSecretId
    ? await getDecryptedSecret(supabase, config.webhookUrlSecretId)
    : config.webhookUrl;

  if (!webhookUrl) {
    throw new Error('Zapier webhook URL not configured');
  }

  // Test Zapier as a webhook
  return testWebhook(
    { ...config, url: webhookUrl, method: 'POST' },
    mockResponse,
    mockQuestions,
    supabase
  );
}
