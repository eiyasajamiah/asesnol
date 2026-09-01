'use client';

import { useState, useEffect } from 'react';

interface Bar {
  height: number;
  up: boolean;
  delay: number;
}

// شريط أسعار حي (تجميلي) — أعمدة شموع يابانية متحركة، الهوية البصرية
// المميزة للموقع بدل الأنماط التقليدية.
export default function PriceTicker() {
  // نبدأ بمصفوفة فارغة لتجنب التضارب مع السيرفر
  const [bars, setBars] = useState<Bar[]>([]);

  useEffect(() => {
    // توليد البيانات العشوائية داخل المتصفح فقط بعد الهيدريشن
    const generatedBars = Array.from({ length: 40 }, (_, i) => ({
      height: 20 + Math.abs(Math.sin(i * 0.5)) * 60 + Math.random() * 20,
      up: Math.random() > 0.45,
      delay: i * 0.05,
    }));
    setBars(generatedBars);
  }, []);

  return (
    <div className="w-full h-24 flex items-end gap-1 overflow-hidden opacity-70">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${bar.up ? 'bg-up/70' : 'bg-down/70'}`}
          style={{
            height: `${bar.height}%`,
            animation: `pulse-bar 2.5s ease-in-out ${bar.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-bar {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
