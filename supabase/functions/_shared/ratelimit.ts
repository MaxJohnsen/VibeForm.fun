import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit@2.0.5';
import { Redis } from 'https://esm.sh/@upstash/redis@1.34.3';

const WINDOW_SECONDS = 60;

export interface RateLimitConfig {
  maxRequests: number; // 0 = disabled
  prefix: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

  if (!url || !token) {
    console.warn('Upstash Redis not configured, rate limiting disabled');
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Rate limiting disabled (0 = unlimited)
  if (config.maxRequests <= 0) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  const redisClient = getRedis();
  if (!redisClient) {
    // Redis not configured, allow request
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  const ratelimit = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${WINDOW_SECONDS} s`),
    analytics: true,
    prefix: config.prefix,
  });

  return await ratelimit.limit(identifier);
}

export function getEnvInt(name: string, defaultValue: number): number {
  const value = Deno.env.get(name);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
