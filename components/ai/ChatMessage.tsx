
'use client';

import { motion } from 'framer-motion';
import { Bot, User, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  timestamp?: Date;
}

export default function ChatMessage({ role, content, isLoading, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
          : 'bg-gradient-to-br from-amber-500 to-orange-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 text-white'
            : 'glass-card border-slate-700 text-slate-200'
        }`}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 bg-amber-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-amber-400 rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-amber-400 rounded-full"
                />
              </div>
              <span className="text-sm text-slate-400">جاري الكتابة...</span>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  strong: ({ children }) => <span className="text-amber-400 font-bold">{children}</span>,
                  em: ({ children }) => <span className="text-slate-300 italic">{children}</span>,
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-300">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 text-xs">{children}</code>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {timestamp && !isLoading && (
          <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span>{timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
            {isUser && <Check className="w-3 h-3 text-blue-400" />}
          </div>
        )}
      </div>
    </motion.div>
  );
}
