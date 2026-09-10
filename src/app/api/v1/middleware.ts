// src/app/api/v1/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/ratelimit';

export async function apiAuth(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' }, 
      { status: 401 }
    );
  }

  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: true },
  });

  if (!keyRecord || !keyRecord.isActive) {
    return NextResponse.json(
      { error: 'Invalid API key' }, 
      { status: 401 }
    );
  }

  // Rate limiting per API key
  const { success, headers } = await rateLimit(apiKey, 'api');
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    );
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  return { userId: keyRecord.userId, user: keyRecord.user };
}