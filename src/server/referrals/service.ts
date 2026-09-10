import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/server/notifications/service';
import Decimal from 'decimal.js';

export class ReferralService {
  // إنشاء رابط إحالة
  static async generateReferralCode(userId: string): Promise<string> {
    const code = this.generateCode();
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });
    return code;
  }

  // تسجيل إحالة جديدة
  static async registerReferral(referredId: string, referralCode: string) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer || referrer.id === referredId) {
      throw new Error('Invalid referral code');
    }

    // التحقق من عدم وجود إحالة سابقة
    const existing = await prisma.referral.findUnique({
      where: { referredId },
    });

    if (existing) {
      throw new Error('User already referred');
    }

    // إنشاء الإحالة
    const referral = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId,
        level: 1,
        commissionRate: 0.10, // 10% للمستوى الأول
      },
    });

    // إنشاء إحالات غير مباشرة (multi-level)
    await this.createIndirectReferrals(referrer.id, referredId);

    return referral;
  }

  // إنشاء إحالات غير مباشرة
  private static async createIndirectReferrals(
    referrerId: string, 
    referredId: string,
    level: number = 2
  ) {
    if (level > 3) return; // حد أقصى 3 مستويات

    const parentReferral = await prisma.referral.findFirst({
      where: { referredId: referrerId },
    });

    if (!parentReferral) return;

    await prisma.referral.create({
      data: {
        referrerId: parentReferral.referrerId,
        referredId,
        level,
        commissionRate: new Decimal(0.10).div(level).toNumber(), // 5% للمستوى 2، 3.33% للمستوى 3
      },
    });

    await this.createIndirectReferrals(
      parentReferral.referrerId, 
      referredId, 
      level + 1
    );
  }

  // حساب العمولة عند دفع المستخدم
  static async calculateCommission(
    userId: string, 
    paymentAmount: Decimal,
    txId: string
  ) {
    const referrals = await prisma.referral.findMany({
      where: { referredId: userId, status: 'ACTIVE' },
    });

    for (const referral of referrals) {
      const commissionAmount = paymentAmount
        .times(referral.commissionRate)
        .toDecimalPlaces(2);

      await prisma.commission.create({
        data: {
          referralId: referral.id,
          amount: commissionAmount,
          type: referral.level === 1 ? 'DIRECT' : 'INDIRECT',
          sourceTxId: txId,
        },
      });

      // تحديث إجمالي الأرباح
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          totalEarned: { increment: commissionAmount },
        },
      });

      // إرسال إشعار
      await NotificationService.referralEarned(
        referral.referrerId,
        commissionAmount.toNumber(),
        'مستخدم جديد'
      );
    }
  }

  private static generateCode(): string {
    return Array.from({ length: 8 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
  }
}