# Asesnol — إعداد المشروع من الصفر

Next.js 16 + Prisma Accelerate (Postgres عبر Neon) + Cloudflare Workers (مجاني) + دفع كريبتو فقط (USDT) + رفع/تنزيل ملفات البوت عبر Cloudflare R2.

## 1) ثبّت الحزم
```bash
npm install
```

## 2) قاعدة البيانات (Neon + Prisma Accelerate)
1. أنشئ مشروع على https://neon.tech (مجاني) — احصل على Connection String (هذا الرابط المباشر).
2. اربطه بـ https://console.prisma.io → أنشئ مشروع → فعّل **Accelerate** → اربطه برابط Neon.
3. انسخ رابط Accelerate (يبدأ بـ `prisma://accelerate.prisma-data.net/?api_key=...`).

## 3) متغيرات البيئة
```bash
cp .env.example .env.local
cp .env.local .env
```
عبّي القيم:
- `DATABASE_URL` = رابط Accelerate (خطوة 2.3)
- `DIRECT_DATABASE_URL` = رابط Neon المباشر (خطوة 2.1) — **لازم** لأوامر db push/seed
- `SESSION_SECRET`, `ADMIN_SECRET` = نصوص عشوائية من اختيارك
- `ETHERSCAN_API_KEY` = من https://etherscan.io/apis (يغطي كل شبكات EVM بمفتاح واحد)
- `TRONGRID_API_KEY` = اختياري من https://trongrid.io

## 4) عدّل عناوين محفظتك
`src/lib/wallet-config.ts` — استبدل عناوين `address` بعناوين محفظتك الحقيقية.

## 5) عدّل رابط الإحالة للبروكر (اختياري)
`src/lib/broker-config.ts`

## 6) أنشئ الجداول وابذر الخطط
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 7) اختبر محليًا
```bash
npm run dev
```

## 8) النشر على Cloudflare
```bash
npx wrangler login
npx wrangler r2 bucket create asesnol-bot-files
npx wrangler secret put DATABASE_URL
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put TRONGRID_API_KEY
npx wrangler secret put ETHERSCAN_API_KEY
npm run deploy
```

لو تنشر عبر Git integration بلوحة Cloudflare، أضف نفس المتغيرات **كمان** بـ:
`Settings → Build → Build Variables and Secrets` (منفصل عن الأسرار وقت التشغيل، تحتاج الاثنين).

## ملاحظات مهمة
- **`next build --webpack`**: مقصود — Turbopack عنده خلل معروف بـ Next.js 16 مع OpenNext/Cloudflare.
- **Accelerate لا يدعم `db push`/`migrate`**: لهذا فصلنا `DIRECT_DATABASE_URL` عن `DATABASE_URL`.
- **الدفع كريبتو فقط**: تحقق تلقائي من البلوكشين خلال ثوانٍ بعد إرسال TXID، وإلا يبقى معلّق لمراجعة الأدمن.
