
import { searchKnowledgeBase } from './knowledge-base';

export interface ChatContext {
  userId?: string;
  userName?: string;
  locale: string;
  walletBalance?: string;
  totalProfit?: string;
  shareRate?: number;
  referralCount?: number;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}

export function buildSystemPrompt(context: ChatContext): string {
  const { locale, userName, walletBalance, totalProfit, shareRate, referralCount } = context;

  const isArabic = locale === 'ar';

  let prompt = isArabic 
    ? `أنت مساعد ذكاء اصطناعي متخصص لمنصة Asesnol — منصة تداول آلي مدعومة بالذكاء الاصطناعي.

قواعدك:
- تحدث باللغة العربية الفصحى والمهنية
- كن ودوداً ومساعداً دائماً
- اجب بإيجاز ووضوح (2-4 جمل كحد أقصى)
- إذا لم تكن متأكداً من الإجابة، قل "لم أفهم سؤالك، هل يمكنك توضيحه؟"
- لا تقدم نصائح استثمارية مالية محددة (مثل "اشترِ هذا السهم")
- يمكنك مساعدة المستخدم في:
  * فهم كيفية عمل المنصة
  * شرح نظام الإحالات
  * توضيح خطط الأسعار
  * مساعدة في التقنية والدعم
  * عرض إحصائيات الحساب

معلومات المستخدم الحالية:
`
    : `You are an AI assistant specialized for Asesnol — an AI-powered automated trading platform.

Your rules:
- Be friendly, professional, and helpful
- Answer concisely and clearly (max 2-4 sentences)
- If unsure, say "I'm not sure I understand. Could you clarify?"
- Do NOT provide specific financial investment advice (like "buy this stock")
- You can help users with:
  * Understanding how the platform works
  * Explaining the referral system
  * Clarifying pricing plans
  * Technical support and help
  * Showing account statistics

Current user information:
`;

  if (userName) {
    prompt += isArabic 
      ? `- الاسم: ${userName}\n`
      : `- Name: ${userName}\n`;
  }

  if (walletBalance) {
    prompt += isArabic
      ? `- الرصيد: $${walletBalance}\n`
      : `- Balance: $${walletBalance}\n`;
  }

  if (totalProfit) {
    prompt += isArabic
      ? `- إجمالي الأرباح: $${totalProfit}\n`
      : `- Total Profit: $${totalProfit}\n`;
  }

  if (shareRate) {
    prompt += isArabic
      ? `- نسبة المشاركة: ${shareRate}%\n`
      : `- Share Rate: ${shareRate}%\n`;
  }

  if (referralCount !== undefined) {
    prompt += isArabic
      ? `- عدد الإحالات: ${referralCount}\n`
      : `- Referrals: ${referralCount}\n`;
  }

  return prompt;
}

export function buildUserPrompt(query: string, context: ChatContext): string {
  // Search knowledge base for relevant info
  const relevantEntries = searchKnowledgeBase(query);

  let enhancedQuery = query;

  if (relevantEntries.length > 0) {
    const knowledge = relevantEntries
      .map((e) => `Q: ${e.question}\nA: ${e.answer}`)
      .join('\n\n');

    enhancedQuery = `User question: ${query}\n\nRelevant knowledge base entries:\n${knowledge}\n\nPlease answer the user's question using the knowledge base if relevant, or use your general knowledge about trading and AI if needed.`;
  }

  return enhancedQuery;
}

// Detect special commands
export function detectCommand(query: string): { type: string; data?: any } | null {
  const lower = query.toLowerCase();

  // Balance commands
  if (lower.includes('balance') || lower.includes('رصيد') || lower.includes('فلوسي')) {
    return { type: 'balance' };
  }

  // Profit commands
  if (lower.includes('profit') || lower.includes('ربح') || lower.includes('أرباح')) {
    return { type: 'profits' };
  }

  // Referral commands
  if (lower.includes('referral') || lower.includes('إحالة') || lower.includes('احالات')) {
    return { type: 'referrals' };
  }

  // Deposit commands
  if (lower.includes('deposit') || lower.includes('إيداع') || lower.includes('اشحن')) {
    return { type: 'deposit' };
  }

  // Withdraw commands
  if (lower.includes('withdraw') || lower.includes('سحب') || lower.includes('اطلب')) {
    return { type: 'withdraw' };
  }

  // Help commands
  if (lower.includes('help') || lower.includes('مساعدة') || lower.includes('كيف')) {
    return { type: 'help' };
  }

  return null;
}

// Generate quick response for commands
export function generateCommandResponse(command: string, context: ChatContext): string | null {
  const { locale, walletBalance, totalProfit, shareRate, referralCount } = context;
  const isArabic = locale === 'ar';

  switch (command) {
    case 'balance':
      if (walletBalance) {
        return isArabic
          ? `رصيدك الحالي: **$${walletBalance}** 💰\n\nيمكنك إيداع المزيد أو سحب أرباحك في أي وقت.`
          : `Your current balance: **$${walletBalance}** 💰\n\nYou can deposit more or withdraw your profits anytime.`;
      }
      break;

    case 'profits':
      if (totalProfit) {
        return isArabic
          ? `إجمالي أرباحك: **$${totalProfit}** 📈\n\nنسبة مشاركتك الحالية: **${shareRate}%**\n\nالأرباح تُوزع أسبوعياً مباشرة إلى محفظتك.`
          : `Your total profits: **$${totalProfit}** 📈\n\nYour current share rate: **${shareRate}%**\n\nProfits are distributed weekly directly to your wallet.`;
      }
      break;

    case 'referrals':
      return isArabic
        ? `لديك **${referralCount || 0}** إحالة نشطة 👥\n\nكل إحالة ناجحة تضيف **20%** إلى نسبة مشاركتك. مع 3 إحالات تصل إلى **100%**!\n\nشارك رابط الإحالة الخاص بك من لوحة التحكم.`
        : `You have **${referralCount || 0}** active referrals 👥\n\nEach successful referral adds **20%** to your share rate. With 3 referrals you reach **100%**!\n\nShare your referral link from the dashboard.`;

    case 'deposit':
      return isArabic
        ? `للإيداع:\n1. اذهب إلى **المحفظة** في لوحة التحكم\n2. اختر **إيداع**\n3. اختر طريقة الدفع (بطاقة أو كريبتو)\n4. أدخل المبلغ واتبع التعليمات\n\nالحد الأدنى: **$500**`
        : `To deposit:\n1. Go to **Wallet** in your dashboard\n2. Select **Deposit**\n3. Choose payment method (Card or Crypto)\n4. Enter amount and follow instructions\n\nMinimum: **$500**`;

    case 'withdraw':
      return isArabic
        ? `للسحب:\n1. اذهب إلى **المحفظة** في لوحة التحكم\n2. اختر **سحب**\n3. أدخل المبلغ وعنوان المحفظة\n4. تأكيد الطلب\n\nيتم المعالجة خلال **24-48 ساعة**.`
        : `To withdraw:\n1. Go to **Wallet** in your dashboard\n2. Select **Withdraw**\n3. Enter amount and wallet address\n4. Confirm request\n\nProcessing time: **24-48 hours**.`;

    case 'help':
      return isArabic
        ? `أوامري المتاحة:\n• **رصيدي** — عرض رصيدك\n• **أرباحي** — عرض أرباحك\n• **إحالاتي** — عرض إحالاتك\n• **إيداع** — كيفية الإيداع\n• **سحب** — كيفية السحب\n• أو اسألني أي سؤال عن المنصة!`
        : `Available commands:\n• **balance** — Show your balance\n• **profits** — Show your profits\n• **referrals** — Show your referrals\n• **deposit** — How to deposit\n• **withdraw** — How to withdraw\n• Or ask me anything about the platform!`;
  }

  return null;
}
