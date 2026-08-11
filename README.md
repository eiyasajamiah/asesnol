
# 🚀 Asesnol — AI-Powered Trading Platform

منصة SaaS لترخيص بوت تداول آلي (EA) — اشتراك شهري لاستخدام البوت على حسابك الخاص، مع نظام إحالات بعمولة ثابتة ومعلنة.

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 🤖 **AI Trading** | خوارزميات ذكية للتداول الآلي |
| 💰 **نظام إحالات** | عمولة ثابتة ومعلنة (20%) لكل مشترك تحيله |
| 🔑 **ترخيص/SaaS** | اشتراك شهري لاستخدام البوت على حسابك الخاص لدى بروكرك |
| 💳 **بوابات دفع** | Stripe + USDT TRC20 |
| 🌐 **ثنائي اللغة** | عربي/إنجليزي |
| 📊 **لوحة تحكم** | إحصائيات ورسوم بيانية |
| 🤖 **مساعد AI** | Grok API + قاعدة معرفة مخصصة |
| 🛡️ **أمان قصوى** | Rate limiting + CSP + HSTS |

## 🛠️ التقنيات

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI**: shadcn/ui + Framer Motion + Lucide Icons
- **i18n**: next-intl
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: JWT + bcrypt + httpOnly cookies
- **Payments**: Stripe + Crypto (USDT TRC20)
- **AI**: Grok API (xAI) + RAG
- **Hosting**: Cloudflare Pages
- **Analytics**: Cloudflare Analytics + Google Analytics 4

## 📁 هيكل المشروع

```
asesnol-website/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              # الصفحة الرئيسية
│   │   ├── about/page.tsx        # من نحن
│   │   ├── faq/page.tsx          # الأسئلة الشائعة
│   │   ├── how-it-works/page.tsx # كيف يعمل
│   │   ├── pricing/page.tsx      # الأسعار
│   │   ├── chat/page.tsx         # مساعد AI
│   │   ├── terms/page.tsx        # شروط الاستخدام
│   │   ├── privacy/page.tsx      # سياسة الخصوصية
│   │   ├── risk-disclaimer/      # إخلاء المسؤولية
│   │   └── dashboard/
│   │       ├── page.tsx          # النظرة العامة
│   │       ├── subscription/page.tsx  # الاشتراك
│   │       ├── referrals/page.tsx # الإحالات
│   │       └── settings/page.tsx # الإعدادات
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── dashboard/route.ts
│   │   ├── subscription/
│   │   │   └── status/route.ts
│   │   ├── referrals/route.ts
│   │   ├── payment/
│   │   │   ├── stripe/
│   │   │   │   ├── create/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   └── crypto/
│   │   │       ├── create/route.ts
│   │   │       └── verify/route.ts
│   │   ├── ai/chat/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── PricingSection.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ProfitChart.tsx
│   │   ├── ReferralChart.tsx
│   │   └── RecentTransactions.tsx
│   ├── payment/
│   │   ├── StripeCheckout.tsx
│   │   └── CryptoDeposit.tsx
│   └── ai/
│       ├── ChatMessage.tsx
│       ├── ChatWidget.tsx
│       └── ChatButton.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── stripe.ts
│   ├── crypto.ts
│   ├── security/
│   │   └── rate-limit.ts
│   └── ai/
│       ├── knowledge-base.ts
│       └── prompts.ts
├── prisma/
│   └── schema.prisma
├── messages/
│   ├── ar.json
│   └── en.json
├── public/
│   └── images/
├── middleware.ts
├── next.config.js
├── wrangler.toml
├── package.json
└── .env.local
```

## 🚀 النشر على Cloudflare

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد البيئة
```bash
cp .env.local.example .env.local
# عدل المتغيرات
```

### 3. قاعدة البيانات
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. البناء والنشر
```bash
npm run build
wrangler pages deploy .next --branch=main
```

## 🔐 متغيرات البيئة

```env
# App
NEXT_PUBLIC_APP_URL=https://asesnol.com

# Database
DATABASE_URL=postgresql://...

# Auth
SESSION_SECRET=your-secret-key

# Admin
ADMIN_SECRET=your-admin-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# AI
XAI_API_KEY=your-xai-api-key

# Crypto
CRYPTO_API_KEY=your-crypto-api-key
```

## 📄 التراخيص

© 2026 Asesnol. جميع الحقوق محفوظة.

---

**Built with ❤️ by Eiyas Ajamiah**
