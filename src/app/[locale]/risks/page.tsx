import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RisksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Risk');

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>
      
      <div className="space-y-6 text-slate-300 leading-relaxed">
        <p>{t('text')}</p>

        <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 mb-3">
            Key Risk Points / نقاط المخاطر الرئيسية
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
            <li>You may lose some or all of your invested capital. / قد تخسر جزءاً أو كل رأس مالك.</li>
            <li>Demo / past results do not guarantee future performance. / النتائج التجريبية لا تضمن نتائج مستقبلية.</li>
            <li>Asesnol does not provide investment advice. / Asesnol ليس نصيحة استثمارية.</li>
            <li>Profit sharing is subject to the terms and the 30-day referral period.</li>
            <li>Deposits are processed manually in the current phase. / الإيداعات تُعالج يدوياً في المرحلة الحالية.</li>
          </ul>
        </div>

        <p className="text-sm text-slate-500">
          By registering and depositing, you acknowledge that you have read, understood, 
          and accept these risks.
          <br />
          بالتسجيل والإيداع، فإنك تقر بأنك قرأت وفهمت وقبلت هذه المخاطر.
        </p>
      </div>
    </div>
  );
}
