import type { KVNamespace } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// ⚠️ تخزين مؤقت عبر KV بدل R2 (لحين تفعيل وسيلة دفع تسمح باستخدام R2).
// KV يدعم حتى 25MB لكل قيمة، وحد ملف البوت عندنا 20MB، فمناسب مؤقتًا.
// للرجوع لـ R2 لاحقًا: استبدل هذا الملف بالنسخة اللي تستخدم R2Bucket،
// وأضف قسم r2_buckets بدل/مع kv_namespaces بـ wrangler.jsonc.

const KEY_PREFIX = 'botfile:';

async function getKV() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any).ASESNOL_KV as KVNamespace | undefined;
  } catch {
    return undefined;
  }
}

export async function uploadBotFile(key: string, file: ArrayBuffer, contentType: string) {
  const kv = await getKV();
  if (!kv) throw new Error('KV namespace (ASESNOL_KV) is not bound');
  await kv.put(KEY_PREFIX + key, file, { metadata: { contentType } });
}

export async function getBotFileStream(
  key: string
): Promise<{ body: ArrayBuffer; httpMetadata?: { contentType?: string } } | null> {
  const kv = await getKV();
  if (!kv) throw new Error('KV namespace (ASESNOL_KV) is not bound');

  const result = await kv.getWithMetadata(KEY_PREFIX + key, 'arrayBuffer');
  if (!result || result.value === null) return null;

  const metadata = result.metadata as { contentType?: string } | null;
  return { body: result.value, httpMetadata: { contentType: metadata?.contentType } };
}

export async function deleteBotFile(key: string) {
  const kv = await getKV();
  if (!kv) throw new Error('KV namespace (ASESNOL_KV) is not bound');
  await kv.delete(KEY_PREFIX + key);
}
