/**
 * Verify a Cloudflare Turnstile token
 * @param token - The token from the client
 * @param ip - Client IP address
 * @param secret - Cloudflare Turnstile secret key
 * @returns true if verification succeeded
 */
export async function verifyTurnstile(
  token: string, 
  ip: string, 
  secret: string
): Promise<boolean> {
  // Validate token length (max 2048 per Cloudflare docs)
  if (!token || token.length > 2048) {
    console.warn('Invalid Turnstile token format:', { length: token?.length });
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: formData }
    );

    const outcome = await result.json();
    
    if (outcome.success) {
      console.log('Turnstile verified:', { 
        hostname: outcome.hostname,
        challenge_ts: outcome.challenge_ts 
      });
    } else {
      console.warn('Turnstile verification failed:', { 
        errorCodes: outcome['error-codes'],
        hostname: outcome.hostname 
      });
    }
    
    return outcome.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

/**
 * Check if Turnstile is configured on the backend
 */
export function isTurnstileConfigured(): boolean {
  return Boolean(Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET'));
}
