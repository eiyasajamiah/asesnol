import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT, localAnswer } from '@/lib/chat-knowledge';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

/**
 * AI Chat endpoint.
 * - If XAI_API_KEY is set → calls Grok (xAI API)
 * - Otherwise → uses local knowledge base (FAQ matcher)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message?: string;
      locale?: string;
      history?: ChatMessage[];
    };
    const message = (body.message || '').trim();
    const locale = body.locale === 'en' ? 'en' : 'ar';
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-10) : [];

    if (!message || message.length > 2000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const apiKey = process.env.XAI_API_KEY;

    if (apiKey) {
      // Call Grok API (xAI)
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.filter((m) => m.role === 'user' || m.role === 'assistant'),
        { role: 'user', content: message },
      ];

      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages,
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Grok API error:', res.status, errText);
        // Fallback to local
        const reply = localAnswer(message, locale);
        return NextResponse.json({ reply, source: 'local-fallback' });
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply =
        data.choices?.[0]?.message?.content?.trim() ||
        localAnswer(message, locale);

      return NextResponse.json({ reply, source: 'grok' });
    }

    // No API key → local knowledge base
    const reply = localAnswer(message, locale);
    return NextResponse.json({ reply, source: 'local' });
  } catch (e) {
    console.error('Chat error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
