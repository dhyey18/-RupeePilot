import { NextResponse } from 'next/server';
import {
  getMarketSnapshot, scoreAssets, getEconomicIndicators,
  getAhmedabadBullionRates, generateTodayVerdict, generateBriefingPoints,
} from '@/app/lib/market';
import { generateAIBriefing, generateAIVerdict } from '@/app/lib/ai';

export async function GET() {
  try {
    const [snapshot, bullion] = await Promise.all([
      getMarketSnapshot(),
      getAhmedabadBullionRates(),
    ]);
    const scores = scoreAssets(snapshot);
    const indicators = getEconomicIndicators();

    // Use AI if key is set; fall back to rule-based if not or if AI fails
    let verdict, briefing;
    if (process.env.OPENAI_API_KEY) {
      [verdict, briefing] = await Promise.all([
        generateAIVerdict(snapshot, scores, bullion).catch(() => generateTodayVerdict(snapshot, scores)),
        generateAIBriefing(snapshot, scores, bullion).catch(() => generateBriefingPoints(snapshot, scores)),
      ]);
    } else {
      verdict = generateTodayVerdict(snapshot, scores);
      briefing = generateBriefingPoints(snapshot, scores);
    }

    return NextResponse.json({ snapshot, scores, indicators, bullion, verdict, briefing });
  } catch (err) {
    console.error('Market fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
