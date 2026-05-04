import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

const kvAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Stub ratelimit that always allows requests when KV is not configured
const allowAll = {
  limit: async (_identifier: string) => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
} as unknown as Ratelimit;

let authRateLimitInstance: Ratelimit;
let signUpRateLimitInstance: Ratelimit;

if (kvAvailable) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  authRateLimitInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  });

  signUpRateLimitInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "15 m"),
    analytics: true,
    prefix: "ratelimit:signup",
  });
} else {
  authRateLimitInstance = allowAll;
  signUpRateLimitInstance = allowAll;
}

export const authRateLimit = authRateLimitInstance;
export const signUpRateLimit = signUpRateLimitInstance;
