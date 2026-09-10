import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// مركزية فحص مفتاح الأدمن — بدون أي قيمة افتراضية احتياطية. لو
// ADMIN_SECRET غير مضبوط، الوصول يُرفض دائماً (fail-closed) بدل الرجوع
// لسر معروف مكتوب بالكود المصدري العلني.
export async function checkAdmin(req: NextRequest): Promise<boolean> {
  let secret = process.env.ADMIN_SECRET;
  try {
    const { env } = await getCloudflareContext({ async: true });
    secret = (env as any).ADMIN_SECRET || secret;
  } catch {
    // خارج بيئة Workers
  }

  if (!secret) {
    console.error('ADMIN_SECRET is not configured — refusing all admin requests.');
    return false;
  }

  // نفضّل الهيدر (لا يُسجَّل بسهولة بسجلات الوصول مثل query string)،
  // لكن نبقي دعم query string كخيار احتياطي للتوافق العكسي فقط.
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  if (!key) return false;

  // مقارنة بزمن ثابت لتقليل مخاطر هجمات القياس الزمني (timing attack)
  return timingSafeStringEqual(key, secret);
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
