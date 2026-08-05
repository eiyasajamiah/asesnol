/**
 * Knowledge base for Asesnol AI agent.
 * Used when Grok API is unavailable, and as system context when it is available.
 */

export const SYSTEM_PROMPT = `You are the official AI assistant for Asesnol, an automated MetaTrader 5 trading platform with a referral-based profit-sharing system.

Key facts about Asesnol:
- Name: Asesnol
- Platform: MetaTrader 5 automated trading bot
- Currency: USD
- Minimum deposit: $50
- Profit sharing:
  - 0 referrals → 50% to investor
  - 1 referral → 70%
  - 2 referrals → 90%
  - 3+ referrals → 100%
- Early bird: First 50 users get 100% profit share for 30 days (no sharing)
- Referral codes start with ASN
- Deposits are requested in the dashboard and approved manually by the admin
- Current phase shows DEMO performance results only (not real trading results)
- Trading involves high risk and may result in loss of capital
- Asesnol is NOT investment advice

Rules:
- Answer in the same language the user writes in (Arabic or English)
- Be professional, clear, and honest
- Never promise guaranteed profits
- Always mention risk when discussing returns
- If asked something outside Asesnol scope, politely redirect
- Do not invent features that do not exist
`;

export const FAQ_ANSWERS: { keywords: string[]; ar: string; en: string }[] = [
  {
    keywords: ['كيف يعمل', 'how it works', 'how does', 'ماذا يفعل', 'what does the bot'],
    ar: 'يعمل بوت Asesnol تلقائياً على منصة MetaTrader 5 على مدار الساعة. بعد تسجيلك وإيداعك، نقوم بتشغيل البوت على حساب التداول. الأرباح تُوزع حسب نظام الإحالات: تبدأ بـ 50% وتزيد 20% مع كل إحالة ناجحة حتى 100%.',
    en: 'The Asesnol bot runs automatically on MetaTrader 5 24/7. After you register and deposit, we run the bot on the trading account. Profits are shared based on referrals: start at 50%, +20% per successful referral, up to 100%.',
  },
  {
    keywords: ['إيداع', 'deposit', 'الحد الأدنى', 'minimum', 'كم أودع'],
    ar: 'الحد الأدنى للإيداع هو 50 دولاراً أمريكياً. يمكنك طلب إيداع من لوحة التحكم، وسيتم مراجعته والموافقة عليه يدوياً قبل إضافة الرصيد إلى محفظتك.',
    en: 'The minimum deposit is $50 USD. You can request a deposit from your dashboard; it will be reviewed and approved manually before the balance is credited to your wallet.',
  },
  {
    keywords: ['إحالة', 'referral', 'نسبة', 'share', 'تقاسم', 'profit share', 'حصة'],
    ar: 'نظام التقاسم: بدون إحالات = 50%، إحالة واحدة = 70%، إحالتان = 90%، 3 إحالات أو أكثر = 100%. المستخدمون الأوائل (أول 50) يحصلون على 100% لمدة 30 يوماً.',
    en: 'Profit share: 0 referrals = 50%, 1 = 70%, 2 = 90%, 3+ = 100%. Early users (first 50) get 100% for 30 days.',
  },
  {
    keywords: ['مخاطر', 'risk', 'خسارة', 'loss', 'آمن', 'safe', 'ضمان'],
    ar: 'التداول ينطوي على مخاطر عالية وقد يؤدي إلى خسارة جزئية أو كاملة لرأس المال. النتائج التجريبية لا تضمن نتائج مستقبلية. Asesnol ليس نصيحة استثمارية. استثمر فقط ما يمكنك تحمل خسارته.',
    en: 'Trading involves high risk and may result in partial or total loss of capital. Demo results do not guarantee future performance. Asesnol is not investment advice. Only invest what you can afford to lose.',
  },
  {
    keywords: ['نتائج', 'performance', 'أرباح', 'profit', 'demo', 'تجريبي'],
    ar: 'حالياً نعرض نتائج تجريبية (Demo) فقط لأغراض العرض. هذه النتائج ليست حقيقية ولا تضمن أداءً مستقبلياً. عند الانتقال للمرحلة الحقيقية سيتم توضيح ذلك بوضوح.',
    en: 'We currently show Demo results only for illustration. These are not real results and do not guarantee future performance. When we move to live results, it will be clearly stated.',
  },
  {
    keywords: ['تسجيل', 'register', 'حساب', 'sign up', 'إنشاء'],
    ar: 'يمكنك إنشاء حساب من صفحة التسجيل. أدخل اسمك وبريدك وكلمة المرور. رمز الإحالة اختياري. بعد التسجيل ستصل إلى لوحة التحكم حيث يمكنك طلب إيداع ومشاركة رابط الإحالة.',
    en: 'Create an account from the Sign Up page. Enter your name, email, and password. Referral code is optional. After registration you reach the dashboard where you can request a deposit and share your referral link.',
  },
  {
    keywords: ['سحب', 'withdraw', 'withdrawal'],
    ar: 'طلبات السحب ستُضاف في مرحلة لاحقة. حالياً النظام يدعم طلبات الإيداع. تواصل مع الدعم لأي استفسار عن السحب.',
    en: 'Withdrawal requests will be added in a later phase. Currently the system supports deposit requests. Contact support for any withdrawal inquiries.',
  },
  {
    keywords: ['تواصل', 'contact', 'دعم', 'support', 'help'],
    ar: 'يمكنك التواصل عبر البريد: support@asesnol.com أو استخدام هذه الدردشة للأسئلة الشائعة حول المنصة.',
    en: 'You can reach us at support@asesnol.com or use this chat for common questions about the platform.',
  },
];

export function localAnswer(message: string, locale: string): string {
  const lower = message.toLowerCase();
  const isAr = locale === 'ar' || /[\u0600-\u06FF]/.test(message);

  for (const faq of FAQ_ANSWERS) {
    if (faq.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return isAr ? faq.ar : faq.en;
    }
  }

  if (isAr) {
    return 'شكراً لسؤالك. يمكنني مساعدتك بخصوص: كيفية عمل البوت، نظام الإحالات ونسب الأرباح، الإيداع، المخاطر، أو التسجيل. اكتب سؤالك بوضوح أو تواصل مع support@asesnol.com';
  }
  return 'Thanks for your question. I can help with: how the bot works, referral & profit share, deposits, risks, or registration. Please rephrase your question or contact support@asesnol.com';
}
