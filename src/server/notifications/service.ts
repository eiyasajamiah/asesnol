import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  // إنشاء إشعار جديد
  static async create(payload: NotificationPayload) {
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data ?? {},
      },
    });

    // إرسال Web Push إذا كان مفعّلاً
    await this.sendWebPush(payload.userId, notification);
    
    // إرسال WebSocket event
    await this.broadcastToUser(payload.userId, notification);

    return notification;
  }

  // إشعارات محددة للأحداث
  static async tradeExecuted(userId: string, trade: { pair: string; profit: number }) {
    return this.create({
      userId,
      type: 'TRADE_EXECUTED',
      title: 'تم تنفيذ صفقة',
      message: `تم فتح صفقة ${trade.pair}`,
      data: trade,
    });
  }

  static async paymentReceived(userId: string, amount: number, txId: string) {
    return this.create({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم استلام الدفع',
      message: `تم تأكيد دفع ${amount} USDT`,
      data: { amount, txId },
    });
  }

  static async referralEarned(userId: string, amount: number, referredUser: string) {
    return this.create({
      userId,
      type: 'REFERRAL_EARNED',
      title: 'ربح إحالة جديد!',
      message: `ربحت ${amount} USDT من إحالة ${referredUser}`,
      data: { amount, referredUser },
    });
  }

  // WebSocket broadcast
  private static async broadcastToUser(userId: string, notification: unknown) {
    // يتم الربط بـ Cloudflare Durable Objects أو Pusher
    // await ws.broadcast(`user:${userId}`, notification);
  }

  // Web Push
  private static async sendWebPush(userId: string, notification: unknown) {
    // يتم الربط بـ web-push library
  }

  // جلب الإشعارات غير المقروءة
  static async getUnread(userId: string) {
    return prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // تحديد كمقروء
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }
}