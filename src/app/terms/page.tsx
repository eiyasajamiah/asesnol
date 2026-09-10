export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">شروط الاستخدام</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. ماهية Asesnol</h2>
          <p>
            Asesnol هي منصة توفر أدوات وأتمتة للتداول. نحن <strong>لسنا بروكراً</strong> ولا نحتفظ بأموال المستخدمين. 
            جميع الصفقات تنفذ عبر بروكرك الخاص في MetaTrader.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. إخلاء المسؤولية عن المخاطر</h2>
          <p>
            التداول في الأسواق المالية ينطوي على مخاطر كبيرة بخسارة رأس المال. البوتات التداولية 
            لا تضمن الأرباح. النتائج السابقة لا تضمن النتائج المستقبلية.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. العلاقة مع البروكر</h2>
          <p>
            أنت مسؤول عن التأكد من أن بروكرك يسمح باستخدام أدوات الطرف الثالث. 
            Asesnol غير مسؤولة عن أي إجراءات يتخذها البروكر ضد حسابك.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. المدفوعات</h2>
          <p>
            جميع المدفوعات تتم بالكريبتو (USDT) وغير قابلة للاسترداد. الاشتراكات تتجدد تلقائياً 
            ما لم يتم الإلغاء قبل 24 ساعة من موعد التجديد.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. حدود المسؤولية</h2>
          <p>
            الحد الأقصى للمسؤولية عن Asesnol هو مبلغ الاشتراك المدفوع آخر 30 يوماً. 
            لسنا مسؤولين عن خسائر التداول الناتجة عن استخدام البوتات.
          </p>
        </section>
      </div>
    </div>
  );
}