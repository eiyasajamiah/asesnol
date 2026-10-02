import type { R2Bucket, R2ObjectBody } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

async function getBotBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as any).BOT_FILES as R2Bucket | undefined;
  if (!bucket) throw new Error('R2 bucket (BOT_FILES) is not bound');
  return bucket;
}

export async function uploadBotFile(key: string, file: ArrayBuffer, contentType: string) {
  const bucket = await getBotBucket();
  await bucket.put(key, file, { httpMetadata: { contentType } });
}

export async function getBotFileStream(key: string): Promise<R2ObjectBody | null> {
  const bucket = await getBotBucket();
  return bucket.get(key);
}

export async function deleteBotFile(key: string) {
  const bucket = await getBotBucket();
  await bucket.delete(key);
}
