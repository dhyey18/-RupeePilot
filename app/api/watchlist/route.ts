import { NextRequest, NextResponse } from 'next/server';
import type { WatchlistItem } from '@/app/lib/types';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchQuoteForSymbol(symbol: string) {
  try {
    const res = await fetch(`${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price: number = meta.regularMarketPrice ?? 0;
    const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
    return { symbol, name: meta.shortName || symbol, price, change, changePercent, currency: meta.currency || 'INR' };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const items: WatchlistItem[] = await req.json();
    const enriched = await Promise.all(
      items.map(async (item) => ({
        ...item,
        quote: await fetchQuoteForSymbol(item.symbol),
      }))
    );
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
