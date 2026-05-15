import { NextResponse } from 'next/server';
import type { NewsItem } from '@/app/lib/types';

export async function GET() {
  try {
    // Yahoo Finance search returns news items for Indian market queries
    const url = 'https://query2.finance.yahoo.com/v1/finance/search?q=india+nifty+sensex+market&newsCount=8&quotesCount=0&enableCb=false';
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // cache 30 min
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!res.ok) throw new Error('Yahoo news fetch failed');
    const json = await res.json();
    const rawNews = json?.news ?? [];

    const items: NewsItem[] = rawNews
      .filter((n: { type?: string }) => n.type === 'STORY')
      .slice(0, 6)
      .map((n: { title?: string; link?: string; publisher?: string; providerPublishTime?: number }) => ({
        title: n.title ?? '',
        link: n.link ?? '',
        publisher: n.publisher ?? 'Financial News',
        providerPublishTime: n.providerPublishTime ?? 0,
      }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
