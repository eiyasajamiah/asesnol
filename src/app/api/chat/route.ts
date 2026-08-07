import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT, localAnswer } from '@/lib/chat-knowledge';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message?: string;
      locale?: string;
      history?: ChatMessage[];
    };
    const message = (body.message || '').trim();
    const locale = body.locale === 'en' ? 'en' : 'ar';
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!message || message.length > 2000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const apiKey = process.env.XAI_API_KEY;

    if (apiKey) {
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.filter((m) => m.role === 'user' || m.role === 'assistant'),
        { role: 'user', content: message },
      ];

      // Add timeout to prevent exceededResources
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
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
            max_tokens: 500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
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
      } catch {
        clearTimeout(timeout);
        const reply = localAnswer(message, locale);
        return NextResponse.json({ reply, source: 'local-fallback' });
      }
    }

    const reply = localAnswer(message, locale);
    return NextResponse.json({ reply, source: 'local' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
