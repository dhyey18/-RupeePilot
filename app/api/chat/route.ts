import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are RupeePilot, a friendly personal finance assistant for a common person living in Ahmedabad, Gujarat, India.

Your user is a salaried professional or a small business person. They speak plain English and sometimes use Hindi/Gujarati terms.

Your job:
- Answer money questions in simple, friendly language — like a knowledgeable friend
- Be direct and practical. Give clear recommendations, not generic advice.
- Use Indian context: SIP, NIFTY, Sensex, gold, FD, PPF, NPS, LIC, ELSS, EPF, home loan, EMI, rent vs buy
- Mention specific numbers and estimates where helpful
- Keep answers concise (3-5 sentences max unless they ask for detail)
- If they ask "should I invest today", give a clear yes/no with a reason
- Understand Gujarat/Ahmedabad context: gold is important, FDs are popular, festive buying patterns
- Don't say "consult a financial advisor" — be the advisor

Common topics:
- Gold buying: When is Dhanteras/Akshaya Tritiya? Is today a good price?
- FD vs Mutual Fund: Which is better for their situation?
- SIP: How much should they invest monthly? What return to expect?
- Tax saving 80C: ELSS, PPF, LIC premiums, home loan principal
- Emergency fund: 6 months of expenses in liquid fund
- Insurance: Term plan, health insurance are must-haves
- Home loan: EMI vs rent, should they prepay?
- Small amounts: What to do with ₹500, ₹1000, ₹5000`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response('AI not configured', { status: 503 });
  }

  const body = await req.json();
  const { messages, marketContext } = body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    marketContext?: string;
  };

  const systemWithContext = marketContext
    ? `${SYSTEM_PROMPT}\n\nCURRENT MARKET DATA (live):\n${marketContext}`
    : SYSTEM_PROMPT;

  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    temperature: 0.5,
    max_tokens: 600,
    messages: [
      { role: 'system', content: systemWithContext },
      ...messages.slice(-12),
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
