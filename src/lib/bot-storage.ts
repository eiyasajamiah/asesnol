import type { KVNamespace } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type BotFileMetadata = { contentType: string };

async function getBotFilesNamespace(): Promise<KVNamespace> {
  const { env } = await getCloudflareContext({ async: true });
  const namespace = (env as any).ASESNOL_KV as KVNamespace | undefined;
  if (!namespace) throw new Error('KV namespace (ASESNOL_KV) is not bound');
  return namespace;
}

const botFileKey = (key: string) => `bot-files:${key}`;

export async function uploadBotFile(key: string, file: ArrayBuffer, contentType: string) {
  const namespace = await getBotFilesNamespace();
  await namespace.put(botFileKey(key), file, { metadata: { contentType } });
}

export async function getBotFile(key: string) {
  const namespace = await getBotFilesNamespace();
  const result = await namespace.getWithMetadata<BotFileMetadata>(botFileKey(key), 'arrayBuffer');
  if (!result.value) return null;

  return {
    body: result.value,
    contentType: result.metadata?.contentType || 'application/octet-stream',
  };
}

export async function deleteBotFile(key: string) {
  const namespace = await getBotFilesNamespace();
  await namespace.delete(botFileKey(key));
}
