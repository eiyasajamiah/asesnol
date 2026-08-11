import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = [
    {
      slug: 'basic',
      name: 'Basic',
      description: 'مثالية للبدء بحساب تداول واحد.',
      priceMonthly: 49,
      priceYearly: 470, // شهرين مجانًا تقريبًا عند الدفع السنوي
      sortOrder: 1,
      features: [
        'ترخيص لاستخدام البوت على حساب تداول واحد',
        'تحديثات البوت مدى فترة الاشتراك',
        'دعم عبر البريد الإلكتروني',
        'الوصول إلى لوحة التحكم والتقارير',
      ],
    },
    {
      slug: 'pro',
      name: 'Pro',
      description: 'للمتداولين الجادين اللي يديرون أكثر من حساب.',
      priceMonthly: 99,
      priceYearly: 950,
      sortOrder: 2,
      features: [
        'ترخيص لاستخدام البوت على حتى 3 حسابات تداول',
        'إعدادات مخاطر متقدمة قابلة للتخصيص',
        'دعم ذو أولوية (رد أسرع)',
        'تحديثات البوت مدى فترة الاشتراك',
        'الوصول إلى لوحة التحكم والتقارير',
      ],
    },
    {
      slug: 'lifetime',
      name: 'Lifetime',
      description: 'ادفع مرة واحدة، استخدم البوت للأبد.',
      priceMonthly: 999, // يُستخدم كسعر الدفعة الواحدة (billingCycle = LIFETIME)
      priceYearly: null,
      sortOrder: 3,
      features: [
        'ترخيص مدى الحياة — بدون تجديد شهري',
        'حسابات تداول غير محدودة',
        'كل التحديثات المستقبلية للبوت مجانًا',
        'دعم ذو أولوية قصوى',
        'الوصول إلى لوحة التحكم والتقارير',
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly ?? undefined,
        sortOrder: plan.sortOrder,
        features: plan.features,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly ?? undefined,
        sortOrder: plan.sortOrder,
        features: plan.features,
        isActive: true,
      },
    });
    console.log(`✓ Plan ready: ${plan.name}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
