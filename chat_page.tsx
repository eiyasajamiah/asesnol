
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send, Sparkles, Trash2, Command, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/ai/ChatMessage';
import { getGreeting } from '@/lib/ai/knowledge-base';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const t = useTranslations('AI');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add greeting on mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getGreeting(locale);
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: greeting + '\n\n' + t('helpPrompt'),
          timestamp: new Date(),
        },
      ]);
    }
  }, [locale, messages.length, t]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          locale,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: locale === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' 
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const greeting = getGreeting(locale);
    setMessages([
      {
        id: 'greeting-new',
        role: 'assistant',
        content: greeting + '\n\n' + t('helpPrompt'),
        timestamp: new Date(),
      },
    ]);
  };

  const quickCommands = [
    { label: locale === 'ar' ? 'رصيدي 💰' : 'My Balance 💰', command: 'رصيدي' },
    { label: locale === 'ar' ? 'أرباحي 📈' : 'My Profits 📈', command: 'أرباحي' },
    { label: locale === 'ar' ? 'إحالاتي 👥' : 'My Referrals 👥', command: 'إحالاتي' },
    { label: locale === 'ar' ? 'كيف أودع؟ 💳' : 'How to deposit? 💳', command: 'كيف أودع' },
    { label: locale === 'ar' ? 'كيف أسحب؟ 🏧' : 'How to withdraw? 🏧', command: 'كيف أسحب' },
    { label: locale === 'ar' ? 'خطط الأسعار 💎' : 'Pricing Plans 💎', command: 'خطط الأسعار' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">Asesnol AI</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-400">{t('online')}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {t('clearChat')}
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}

          {isLoading && (
            <ChatMessage
              role="assistant"
              content=""
              isLoading={true}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Commands */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-800 bg-slate-950/50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Command className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">{t('quickCommands')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => {
                    setInput(cmd.command);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              rows={1}
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('send')}</span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            {t('poweredBy')} Grok AI • {t('disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
