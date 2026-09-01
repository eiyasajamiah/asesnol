import type { R2Bucket } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

async function getR2() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as any).BOT_FILES as R2Bucket | undefined;
  } catch {
    return undefined;
  }
}

export async function uploadBotFile(key: string, file: ArrayBuffer, contentType: string) {
  const r2 = await getR2();
  if (!r2) throw new Error('R2 bucket (BOT_FILES) is not bound');
  await r2.put(key, file, { httpMetadata: { contentType } });
}

export async function getBotFileStream(key: string) {
  const r2 = await getR2();
  if (!r2) throw new Error('R2 bucket (BOT_FILES) is not bound');
  return r2.get(key);
}

export async function deleteBotFile(key: string) {
  const r2 = await getR2();
  if (!r2) throw new Error('R2 bucket (BOT_FILES) is not bound');
  await r2.delete(key);
}
