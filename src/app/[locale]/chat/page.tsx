'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatPage() {
  const t = useTranslations('Chat');
  const locale = useLocale();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        locale === 'ar'
          ? 'مرحباً! أنا مساعد Asesnol الذكي. اسألني عن البوت، نظام الإحالات، الإيداع، أو المخاطر.'
          : "Hello! I'm the Asesnol AI assistant. Ask me about the bot, referrals, deposits, or risks.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, locale, history }),
      });

      const data = (await res.json()) as { reply?: string };
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              locale === 'ar'
                ? 'عذراً، حدث خطأ. حاول مرة أخرى.'
                : 'Sorry, something went wrong. Please try again.',
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? '' }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            locale === 'ar'
              ? 'تعذر الاتصال. تحقق من الشبكة وحاول مجدداً.'
              : 'Connection failed. Check your network and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const suggestions =
    locale === 'ar'
      ? ['كيف يعمل البوت؟', 'ما نظام الإحالات؟', 'الحد الأدنى للإيداع؟', 'ما المخاطر؟']
      : ['How does the bot work?', 'Referral system?', 'Minimum deposit?', 'What are the risks?'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3">
          <Bot className="w-3.5 h-3.5" />
          AI Agent
        </div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-sm text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                m.role === 'assistant'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'assistant'
                  ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                  : 'bg-emerald-500/20 text-emerald-100 rounded-tr-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-400 text-sm">
              …
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
              }}
              className="px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder={t('placeholder')}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none text-sm"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-slate-600 text-center mt-3">{t('disclaimer')}</p>
    </div>
  );
}
