export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">سياسة الخصوصية</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3">البيانات التي نجمعها</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>عنوان البريد الإلكتروني</li>
            <li>عناوين محافظ الكريبتو للمدفوعات</li>
            <li>سجل استخدام البوتات (لا نرى أرصدة التداول)</li>
            <li>عنوان IP (للأمان فقط)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">البيانات التي <strong>لا</strong> نجمعها</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>بيانات تسجيل الدخول لبروكرك</li>
            <li>أرصدة حساب التداول</li>
            <li>معلومات شخصية (KYC) - هذه مسؤولية البروكر</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">كيف نستخدم بياناتك</h2>
          <p>
            نستخدم البيانات فقط لتشغيل الخدمة وإرسال الإشعارات. لا نبيع بياناتك لأطراف ثالثة.
            يتم تخزين البيانات على خوادم Cloudflare وNeon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">حقوقك</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>الوصول لبياناتك</li>
            <li>تصحيح البيانات</li>
            <li>حذف الحساب وبياناته</li>
            <li>تصدير بياناتك</li>
          </ul>
        </section>
      </div>
    </div>
  );
}