import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { getBotFileStream } from '@/lib/bot-storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const activeSub = user.subscriptions[0];
  if (!activeSub || activeSub.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'An active subscription is required to download the bot' }, { status: 403 });
  }

  const { id } = await params;
  const prisma = await getPrisma();
  const bot =
    id === 'latest'
      ? await prisma.botRelease.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
      : await prisma.botRelease.findUnique({ where: { id } });
  if (!bot || !bot.isActive) {
    return NextResponse.json({ error: 'Bot release not found' }, { status: 404 });
  }

  const obj = await getBotFileStream(bot.fileKey);
  if (!obj) return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });

  return new NextResponse(obj.body as any, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${bot.fileName}"`,
    },
  });
}
