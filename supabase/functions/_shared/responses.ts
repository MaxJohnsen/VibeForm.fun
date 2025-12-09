import { corsHeaders } from './cors.ts';

/**
 * Create a standardized JSON success response
 */
export function jsonResponse<T>(
  data: T, 
  status = 200, 
  extraHeaders?: Record<string, string>
): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        ...extraHeaders,
      } 
    }
  );
}

/**
 * Create a standardized JSON error response
 */
export function jsonError(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
}

/**
 * Create a rate limit exceeded response with proper headers
 */
export function rateLimitResponse(
  reset: number, 
  limit: number,
  message = 'Too many requests. Please try again later.'
): Response {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({ 
      error: message,
      retryAfter,
    }),
    { 
      status: 429, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': retryAfter.toString(),
      } 
    }
  );
}
