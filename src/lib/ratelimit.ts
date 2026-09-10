import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// استراتيجيات مختلفة للحد من الطلبات
export const ratelimits = {
  // تسجيل الدخول: 5 محاولات كل 15 دقيقة
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
  }),

  // API عام: 100 طلب كل دقيقة
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),

  // إنشاء بوت: 3 بوتات كل ساعة
  botCreation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
  }),

  // مدفوعات: 10 محاولات كل ساعة
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
  }),
};

// Middleware للاستخدام في API Routes
export async function rateLimit(
  identifier: string,
  limiter: keyof typeof ratelimits
) {
  const { success, limit, remaining, reset } = await ratelimits[limiter].limit(identifier);
  
  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}