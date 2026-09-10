import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorAuthService {
  // توليد سر جديد للمستخدم
  static generateSecret(userEmail: string) {
    const secret = speakeasy.generateSecret({
      name: `Asesnol (${userEmail})`,
      length: 32,
    });
    return secret;
  }

  // توليد رابط QR Code
  static async generateQRCode(otpAuthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpAuthUrl);
  }

  // التحقق من الرمز المُدخل
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // يسمح بـ ±1 فترة زمنية (30 ثانية)
    });
  }

  // توليد رموز احتياطية
  static generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(
        Array.from({ length: 8 }, () => 
          'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
        ).join('')
      );
    }
    return codes;
  }
}