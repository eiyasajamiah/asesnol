
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildSystemPrompt, buildUserPrompt, detectCommand, generateCommandResponse } from '@/lib/ai/prompts';

const GROK_API_KEY = process.env.XAI_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, locale = 'ar' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user data if authenticated
    const user = await getCurrentUser();
    let walletBalance, totalProfit, shareRate, referralCount;

    if (user) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
      });

      const profitAgg = await prisma.profit.aggregate({
        where: { userId: user.id, status: 'PAID' },
        _sum: { amount: true },
      });

      const refCount = await prisma.referral.count({
        where: { referrerId: user.id, status: 'ACTIVE' },
      });

      walletBalance = wallet?.balance?.toString() || '0';
      totalProfit = profitAgg._sum?.amount?.toString() || '0';
      shareRate = user.shareRate;
      referralCount = refCount;
    }

    // Build context
    const context = {
      userId: user?.id,
      userName: user?.name || undefined,
      locale,
      walletBalance,
      totalProfit,
      shareRate,
      referralCount,
      conversationHistory: [],
    };

    // Check for special commands first
    const command = detectCommand(message);
    if (command) {
      const quickResponse = generateCommandResponse(command.type, context);
      if (quickResponse) {
        return NextResponse.json({
          response: quickResponse,
          source: 'command',
          command: command.type,
        });
      }
    }

    // If no Grok API key, use knowledge base fallback
    if (!GROK_API_KEY) {
      const { searchKnowledgeBase } = await import('@/lib/ai/knowledge-base');
      const entries = searchKnowledgeBase(message);

      if (entries.length > 0) {
        return NextResponse.json({
          response: entries[0].answer,
          source: 'knowledge_base',
        });
      }

      const fallback = locale === 'ar'
        ? 'عذراً، لا أستطيع الإجابة على هذا السؤال حالياً. يرجى التواصل مع الدعم الفني.'
        : "Sorry, I can't answer this question right now. Please contact support.";

      return NextResponse.json({
        response: fallback,
        source: 'fallback',
      });
    }

    // Build prompts for Grok
    const systemPrompt = buildSystemPrompt(context);
    const userPrompt = buildUserPrompt(message, context);

    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Grok API error:', errorData);
      throw new Error('Grok API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      response: aiResponse,
      source: 'grok',
    });
  } catch (error) {
    console.error('AI Chat error:', error);

    const locale = 'ar'; // Default fallback
    const fallback = locale === 'ar'
      ? 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.'
      : 'Sorry, there was an error connecting to the AI. Please try again later.';

    return NextResponse.json(
      { response: fallback, source: 'error' },
      { status: 200 }
    );
  }
}
