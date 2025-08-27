import { Redis } from '@upstash/redis';

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. Redis functionality will be limited or unavailable.');
  // Optionally, throw an error or use a fallback if Redis is critical
  // throw new Error('Missing Upstash Redis environment variables');
}

export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL || 'http://localhost:8070', // Fallback for local development/testing without Upstash
  token: UPSTASH_REDIS_REST_TOKEN || 'local_token', // Fallback
});
