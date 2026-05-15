import OpenAI from 'openai';
import type { MarketSnapshot, AssetScore, AhmedabadBullionRate, BriefingPoint, TodayVerdict } from './types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildMarketContext(
  snapshot: MarketSnapshot,
  scores: AssetScore[],
  bullion: AhmedabadBullionRate
): string {
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
  return `
LIVE MARKET DATA (India, today):
- NIFTY 50: ₹${fmt(snapshot.nifty50.price)} (${snapshot.nifty50.changePercent > 0 ? '+' : ''}${snapshot.nifty50.changePercent.toFixed(2)}%)
- SENSEX: ₹${fmt(snapshot.sensex.price)} (${snapshot.sensex.changePercent > 0 ? '+' : ''}${snapshot.sensex.changePercent.toFixed(2)}%)
- Bank Nifty: ₹${fmt(snapshot.bankNifty.price)} (${snapshot.bankNifty.changePercent > 0 ? '+' : ''}${snapshot.bankNifty.changePercent.toFixed(2)}%)
- USD/INR: ₹${snapshot.usdinr.price.toFixed(2)} (${snapshot.usdinr.changePercent > 0 ? '+' : ''}${snapshot.usdinr.changePercent.toFixed(2)}%)
- Gold ETF (GOLDBEES): ₹${snapshot.gold.price.toFixed(2)} (${snapshot.gold.changePercent > 0 ? '+' : ''}${snapshot.gold.changePercent.toFixed(2)}%)
- Silver ETF (SilverBees): ₹${snapshot.silver.price.toFixed(2)} (${snapshot.silver.changePercent > 0 ? '+' : ''}${snapshot.silver.changePercent.toFixed(2)}%)

AHMEDABAD BULLION RATES:
- Gold 24K: ₹${fmt(bullion.gold24k_10g)} per 10g
- Gold 22K: ₹${fmt(bullion.gold22k_10g)} per 10g
- Silver: ₹${fmt(bullion.silver_kg)} per kg

TOP ASSET SCORES TODAY:
${scores.slice(0, 4).map(s => `- ${s.name}: ${s.score}/100 (${s.recommendation}) — ${s.reason}`).join('\n')}
`.trim();
}

export async function generateAIBriefing(
  snapshot: MarketSnapshot,
  scores: AssetScore[],
  bullion: AhmedabadBullionRate
): Promise<BriefingPoint[]> {
  const context = buildMarketContext(snapshot, scores, bullion);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: `You are a friendly personal finance assistant for an Indian salaried professional in Ahmedabad, Gujarat.
Your job is to give a short, plain-language morning/afternoon briefing about today's Indian markets.
- Write like a knowledgeable friend, not a formal analyst
- Use simple words, no jargon
- Be direct about what the person should or shouldn't do today
- Reference Indian context: SIP, index funds, NIFTY, gold, FDs, PPF
- Keep each point short and actionable
- Do NOT use emojis`,
      },
      {
        role: 'user',
        content: `It is ${timeOfDay} in India. Here is today's live market data:\n\n${context}\n\nWrite exactly 4 briefing points as a JSON array. Each point must have:
- "type": one of "positive", "negative", "neutral", "action", "warning"
- "headline": short title (max 10 words)
- "detail": 1-2 sentences explaining what it means for a normal investor

Respond with ONLY the JSON array, no explanation.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
  try {
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''));
    return Array.isArray(parsed) ? parsed.slice(0, 4) : fallbackBriefing(snapshot, scores);
  } catch {
    return fallbackBriefing(snapshot, scores);
  }
}

export async function generateAIVerdict(
  snapshot: MarketSnapshot,
  scores: AssetScore[],
  bullion: AhmedabadBullionRate
): Promise<TodayVerdict> {
  const context = buildMarketContext(snapshot, scores, bullion);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.35,
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: `You are a personal finance assistant for a salaried Indian professional.
Give a clear, direct verdict on what they should do with their money today.
Be like a smart friend who knows markets — confident, simple, no fluff.`,
      },
      {
        role: 'user',
        content: `${context}\n\nRespond with a JSON object (no markdown) with these exact keys:
- "headline": one punchy sentence about today's market (max 12 words)
- "subtext": 2 sentences explaining why and what it means for the investor
- "action": one of "invest_now", "hold", "wait", "rebalance", "sip_day"
- "actionLabel": 2-3 word call to action label
- "actionDetail": one clear sentence on what specifically to do
- "confidenceScore": number 0-100
- "marketMood": one of "bullish", "bearish", "sideways", "volatile"`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
  try {
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''));
    return {
      greeting,
      headline: parsed.headline ?? 'Markets are open — here is your update',
      subtext: parsed.subtext ?? '',
      action: parsed.action ?? 'sip_day',
      actionLabel: parsed.actionLabel ?? 'Continue SIP',
      actionDetail: parsed.actionDetail ?? 'Keep your regular investment going.',
      confidenceScore: parsed.confidenceScore ?? 65,
      marketMood: parsed.marketMood ?? 'sideways',
    };
  } catch {
    return fallbackVerdict(snapshot, scores, greeting);
  }
}

// Rule-based fallbacks if OpenAI call fails
function fallbackBriefing(snapshot: MarketSnapshot, scores: AssetScore[]): BriefingPoint[] {
  const points: BriefingPoint[] = [];
  const nc = snapshot.nifty50.changePercent;
  points.push({
    type: nc >= 0 ? 'positive' : 'negative',
    headline: `NIFTY is ${nc >= 0 ? 'up' : 'down'} ${Math.abs(nc).toFixed(2)}% today`,
    detail: nc < -1.5 ? 'Good time to add to your SIP or index fund.' : nc > 1.5 ? 'Rally in progress — stay invested, avoid selling.' : 'Steady market — continue your regular investments.',
  });
  const top = scores[0];
  points.push({ type: 'action', headline: `Best pick today: ${top.name}`, detail: top.reason });
  points.push({ type: 'neutral', headline: 'Stay consistent with your SIP', detail: 'Daily market moves are noise. Long-term consistency wins.' });
  return points;
}

function fallbackVerdict(snapshot: MarketSnapshot, scores: AssetScore[], greeting: string): TodayVerdict {
  const nc = snapshot.nifty50.changePercent;
  return {
    greeting,
    headline: nc < -1 ? 'Market dip — a buying opportunity' : nc > 1 ? 'Markets are up today' : 'Calm market day',
    subtext: 'Continue your regular investments and SIPs.',
    action: 'sip_day',
    actionLabel: 'Continue SIP',
    actionDetail: 'Keep your SIP running regardless of daily moves.',
    confidenceScore: 65,
    marketMood: nc < -1.5 ? 'bearish' : nc > 1.5 ? 'bullish' : 'sideways',
  };
}
