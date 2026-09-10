'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function RiskDisclosure() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-yellow-800 mb-2">
            إفصاح المخاطر المهمة
          </h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>
              • <strong>خسارة رأس المال:</strong> التداول بالرافعة المالية قد يؤدي لخسارة 
              أكبر من إيداعك الأولي.
            </li>
            <li>
              • <strong>أداء البوتات:</strong> البوتات تعتمد على الظروف السوقية السابقة 
              وقد تفشل في ظروف جديدة.
            </li>
            <li>
              • <strong>انقطاع الخدمة:</strong> قد يتوقف البوت عن العمل بسبب مشاكل فنية، 
              مما يؤدي لصفقات مفتوحة دون إدارة.
            </li>
            <li>
              • <strong>انزلاق الأسعار (Slippage):</strong> الأسعار الفعلية قد تختلف عن 
              الأسعار المتوقعة، خاصة في الأسواق المتقلبة.
            </li>
            <li>
              • <strong>السيولة:</strong> في أوقات الأخبار الهامة، قد يكون من الصعب 
              إغلاق الصفقات بالسعر المطلوب.
            </li>
          </ul>
          
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="risk-accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 rounded border-yellow-400"
            />
            <label htmlFor="risk-accept" className="text-sm font-medium text-yellow-800">
              أقر بأنني فهمت المخاطر وأنني أتداول على مسؤوليتي الشخصية
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}