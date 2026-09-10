import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const path = request.nextUrl.pathname;

  // Rate limiting للمسارات الحساسة
  if (path.startsWith('/api/auth/login')) {
    const { success, headers } = await rateLimit(ip, 'login');
    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers }
      );
    }
  }

  // Rate limiting عام لكل API
  if (path.startsWith('/api/')) {
    const { success, headers } = await rateLimit(ip, 'api');
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};