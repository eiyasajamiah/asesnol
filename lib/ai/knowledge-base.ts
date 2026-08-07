
export interface KnowledgeEntry {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  // General
  {
    question: "What is Asesnol?",
    answer: "Asesnol is an AI-powered automated trading platform. We provide smart trading signals, automatic profits, and a rewarding referral system that reaches up to 100% profit share.",
    category: "general",
    keywords: ["what", "asesnol", "platform", "trading"],
  },
  {
    question: "كيف تعمل منصة Asesnol؟",
    answer: "Asesnol هي منصة تداول آلي مدعومة بالذكاء الاصطناعي. نقوم بتحليل السوق باستخدام خوارزميات متطورة، وننفذ الصفقات تلقائياً نيابة عنك. أرباحك تُوزع بشكل دوري مباشرة إلى محفظتك الداخلية.",
    category: "general",
    keywords: ["كيف", "تعمل", "منصة", "آلي"],
  },
  // Trading
  {
    question: "What is the minimum deposit?",
    answer: "The minimum deposit is $500 USD for the Starter plan. Higher plans require larger investments with additional features.",
    category: "trading",
    keywords: ["minimum", "deposit", "amount", "starter"],
  },
  {
    question: "ما هو الحد الأدنى للإيداع؟",
    answer: "الحد الأدنى للإيداع هو 500 دولار أمريكي للخطة الأساسية. الخطط الأعلى تتطلب استثمارات أكبر مع ميزات إضافية.",
    category: "trading",
    keywords: ["حد", "أدنى", "إيداع", "500"],
  },
  {
    question: "How does the referral system work?",
    answer: "When a new user registers with your referral code, you get an additional 20% profit share. With 3 successful referrals, your share reaches 100%.",
    category: "referral",
    keywords: ["referral", "system", "work", "share"],
  },
  {
    question: "كيف يعمل نظام الإحالات؟",
    answer: "عند تسجيل مستخدم جديد برمز الإحالة الخاص بك، تحصل على 20% إضافية من نسبة أرباحك. مع 3 إحالات ناجحة تصل نسبتك إلى 100%.",
    category: "referral",
    keywords: ["إحالات", "نظام", "نسبة", "100"],
  },
  // Profits
  {
    question: "When are profits distributed?",
    answer: "Profits are distributed weekly directly to your internal wallet. You can withdraw or reinvest them at any time.",
    category: "profits",
    keywords: ["profits", "distributed", "weekly", "wallet"],
  },
  {
    question: "متى يتم توزيع الأرباح؟",
    answer: "يتم توزيع الأرباح بشكل أسبوعي مباشرة إلى محفظتك الداخلية. يمكنك سحبها أو إعادة استثمارها في أي وقت.",
    category: "profits",
    keywords: ["أرباح", "توزيع", "أسبوعي", "محفظة"],
  },
  // Security
  {
    question: "Is my money safe?",
    answer: "Yes, we use military-grade encryption, secure sessions, and two-factor authentication. We also provide a clear risk disclaimer page.",
    category: "security",
    keywords: ["safe", "money", "secure", "encryption"],
  },
  {
    question: "هل أموالي آمنة؟",
    answer: "نعم، نستخدم تشفيراً عسكرياً لحماية البيانات، وجلسات آمنة، ونظام مصادقة ثنائي. كما نوفر صفحة إخلاء مسؤولية واضحة عن المخاطر.",
    category: "security",
    keywords: ["آمنة", "أموال", "تشفير", "حماية"],
  },
  // Withdrawal
  {
    question: "Can I withdraw my money anytime?",
    answer: "Yes, you can submit a withdrawal request at any time. Withdrawals are processed within 24-48 business hours.",
    category: "withdrawal",
    keywords: ["withdraw", "money", "anytime", "request"],
  },
  {
    question: "هل يمكنني سحب أموالي في أي وقت؟",
    answer: "نعم، يمكنك تقديم طلب سحب في أي وقت. يتم معالجة طلبات السحب خلال 24-48 ساعة عمل.",
    category: "withdrawal",
    keywords: ["سحب", "أموال", "أي", "وقت"],
  },
  // AI
  {
    question: "How does the AI trading work?",
    answer: "Our AI analyzes market data using advanced algorithms including machine learning and pattern recognition. It executes trades 24/7 based on predefined strategies and risk management rules.",
    category: "ai",
    keywords: ["ai", "trading", "algorithm", "machine learning"],
  },
  {
    question: "كيف يعمل التداول بالذكاء الاصطناعي؟",
    answer: "يقوم ذكاؤنا الاصطناعي بتحليل بيانات السوق باستخدام خوارزميات متقدمة تشمل التعلم الآلي واكتشاف الأنماط. ينفذ الصفقات على مدار 24/7 بناءً على استراتيجيات محددة وقواعد إدارة المخاطر.",
    category: "ai",
    keywords: ["ذكاء", "اصطناعي", "تداول", "خوارزميات"],
  },
  // Plans
  {
    question: "What are the available plans?",
    answer: "We offer three plans: Starter ($500), Pro ($2,000), and VIP ($5,000). Each plan offers different features, profit shares, and support levels.",
    category: "plans",
    keywords: ["plans", "starter", "pro", "vip", "pricing"],
  },
  {
    question: "ما هي الخطط المتاحة؟",
    answer: "نقدم ثلاث خطط: البداية (500$)، الاحترافي (2000$)، وVIP (5000$). كل خطة تقدم ميزات مختلفة، ونسب أرباح، ومستويات دعم متفاوتة.",
    category: "plans",
    keywords: ["خطط", "بداية", "احترافي", "VIP"],
  },
];

// Search knowledge base using keywords
export function searchKnowledgeBase(query: string): KnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  const scored = knowledgeBase.map((entry) => {
    let score = 0;

    // Check keywords
    entry.keywords.forEach((keyword) => {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });

    // Check question similarity
    const questionWords = entry.question.toLowerCase().split(/\s+/);
    queryWords.forEach((word) => {
      if (questionWords.includes(word)) {
        score += 1;
      }
    });

    return { entry, score };
  });

  // Sort by score and filter relevant ones
  const relevant = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.entry);

  return relevant;
}

// Get greeting based on time
export function getGreeting(locale: string): string {
  const hour = new Date().getHours();

  if (locale === 'ar') {
    if (hour < 12) return 'صباح الخير! كيف يمكنني مساعدتك اليوم؟';
    if (hour < 18) return 'مساء الخير! كيف يمكنني مساعدتك؟';
    return 'مساء النور! كيف يمكنني مساعدتك؟';
  }

  if (hour < 12) return 'Good morning! How can I help you today?';
  if (hour < 18) return 'Good afternoon! How can I assist you?';
  return 'Good evening! How can I help you?';
}
