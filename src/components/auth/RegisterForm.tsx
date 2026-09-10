// src/components/auth/RegisterForm.tsx
export function RegisterForm() {
  return (
    <form className="space-y-4">
      {/* ... حقول التسجيل ... */}
      
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p className="mb-2">
          <strong>تنويه قانوني:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            Asesnol ليست بروكراً أو مستشاراً مالياً. نحن نوفر أدوات تقنية فقط.
          </li>
          <li>
            أنت مسؤول عن التأكد من قانونية استخدام هذه الأدوات في بلدك وبروكرك.
          </li>
          <li>
            التداول ينطوي على مخاطر. لا تستثمر ما لا تستطيع تحمل خسارته.
          </li>
        </ul>
      </div>

      <label className="flex items-start gap-2">
        <input type="checkbox" required className="mt-1" />
        <span className="text-sm">
          أوافق على <a href="/terms" className="underline">شروط الاستخدام</a> و
          <a href="/privacy" className="underline">سياسة الخصوصية</a> وأقر بأنني 
          فهمت <a href="/risk" className="underline">مخاطر التداول</a>
        </span>
      </label>
    </form>
  );
}