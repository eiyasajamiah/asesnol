import { NextRequest } from 'next/server';
import type { KVNamespace } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// تحديد معدل بسيط مبني على ASESNOL_KV (كانت معرّفة بـ wrangler.jsonc
// لكن غير مستخدمة بأي مكان بالكود). يحمي مسارات الدخول/التسجيل من
// هجمات التخمين بالقوة الغاشمة (brute force).
//
// ملاحظة: KV غير متسق فورياً (eventual consistency)، فهذا ليس ضماناً
// رياضياً دقيقاً، لكنه كافٍ تماماً لإبطاء المهاجم بشكل فعّال.
export async function isRateLimited(
  req: NextRequest,
  bucket: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as any).ASESNOL_KV as KVNamespace | undefined;
    if (!kv) return false; // لو KV غير متاح (مثلاً بالتطوير المحلي)، لا نحظر أحداً

    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const key = `ratelimit:${bucket}:${ip}`;

    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= limit) return true;

    await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
    return false;
  } catch (e) {
    console.error('Rate limit check failed:', e);
    return false; // لا نمنع المستخدمين الشرعيين بسبب خطأ بالبنية التحتية
  }
}
