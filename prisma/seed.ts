import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
} as any);

async function main() {
  const plans = [
    {
      slug: 'basic',
      name: 'Basic',
      description: 'مثالية للبدء بحساب تداول واحد.',
      priceMonthly: 49,
      priceYearly: 470,
      sortOrder: 1,
      features: [
        'ترخيص لاستخدام البوت على حساب تداول واحد',
        'تحديثات البوت مدى فترة الاشتراك',
        'دعم عبر البريد الإلكتروني',
      ],
    },
    {
      slug: 'pro',
      name: 'Pro',
      description: 'للمتداولين اللي يديرون أكثر من حساب.',
      priceMonthly: 99,
      priceYearly: 950,
      sortOrder: 2,
      features: [
        'ترخيص على حتى 3 حسابات تداول',
        'إعدادات مخاطر متقدمة',
        'دعم ذو أولوية',
        'تحديثات البوت مدى فترة الاشتراك',
      ],
    },
    {
      slug: 'lifetime',
      name: 'Lifetime',
      description: 'ادفع مرة واحدة، استخدم البوت للأبد.',
      priceMonthly: 999,
      priceYearly: null,
      sortOrder: 3,
      features: [
        'ترخيص مدى الحياة',
        'حسابات تداول غير محدودة',
        'كل التحديثات المستقبلية مجانًا',
        'دعم ذو أولوية قصوى',
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, priceYearly: plan.priceYearly ?? undefined },
      create: { ...plan, priceYearly: plan.priceYearly ?? undefined },
    });
    console.log(`✓ ${plan.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
