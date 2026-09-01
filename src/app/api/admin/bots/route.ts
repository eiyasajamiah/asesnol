import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { uploadBotFile, deleteBotFile } from '@/lib/bot-storage';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'asesnol-admin-change-me';

function checkAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  return key === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const prisma = await getPrisma();
  const bots = await prisma.botRelease.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ bots });
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const version = formData.get('version') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;

    if (!file || !version || !title) {
      return NextResponse.json({ error: 'Missing file, version, or title' }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
    }

    const prisma = await getPrisma();
    const fileKey = `bots/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    await uploadBotFile(fileKey, buffer, file.type || 'application/octet-stream');

    const bot = await prisma.botRelease.create({
      data: { version, title, description: description || undefined, fileName: file.name, fileKey, fileSizeKb: Math.round(file.size / 1024) },
    });

    return NextResponse.json({ bot });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await req.json()) as { botId?: string };
    if (!body.botId) return NextResponse.json({ error: 'Missing botId' }, { status: 400 });

    const prisma = await getPrisma();
    const bot = await prisma.botRelease.findUnique({ where: { id: body.botId } });
    if (!bot) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await deleteBotFile(bot.fileKey);
    await prisma.botRelease.delete({ where: { id: body.botId } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
