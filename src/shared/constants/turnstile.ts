// Public Cloudflare Turnstile site key
// Set VITE_TURNSTILE_SITE_KEY in .env for production
// Test keys: https://developers.cloudflare.com/turnstile/troubleshooting/testing/

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

// Check if Turnstile is configured
export const isTurnstileConfigured = (): boolean => {
  return Boolean(TURNSTILE_SITE_KEY && TURNSTILE_SITE_KEY.length > 0);
};
