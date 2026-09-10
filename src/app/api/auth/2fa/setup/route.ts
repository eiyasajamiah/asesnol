// src/app/api/auth/2fa/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/server/auth/session';
import { TwoFactorAuthService } from '@/server/auth/2fa';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = TwoFactorAuthService.generateSecret(session.user.email);
  const qrCodeUrl = await TwoFactorAuthService.generateQRCode(secret.otpauth_url!);
  const backupCodes = TwoFactorAuthService.generateBackupCodes();

  // حفظ السر مؤقتاً (حتى يتم التفعيل)
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: secret.base32,
      backupCodes,
    },
  });

  return NextResponse.json({
    qrCodeUrl,
    backupCodes,
    manualEntryKey: secret.base32,
  });
}

// src/app/api/auth/2fa/verify/route.ts
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const session = await getServerSession();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const isValid = TwoFactorAuthService.verifyToken(
    user.twoFactorSecret!,
    token
  );

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid code' }, 
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ success: true });
}