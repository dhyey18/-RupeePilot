import { NextResponse } from 'next/server';
import type { Mover } from '@/app/lib/types';

const STOCKS: { symbol: string; name: string }[] = [
  { symbol: 'RELIANCE.NS',   name: 'Reliance'       },
  { symbol: 'TCS.NS',        name: 'TCS'             },
  { symbol: 'HDFCBANK.NS',   name: 'HDFC Bank'       },
  { symbol: 'INFY.NS',       name: 'Infosys'         },
  { symbol: 'ICICIBANK.NS',  name: 'ICICI Bank'      },
  { symbol: 'KOTAKBANK.NS',  name: 'Kotak Bank'      },
  { symbol: 'LT.NS',         name: 'L&T'             },
  { symbol: 'SBIN.NS',       name: 'SBI'             },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel'   },
  { symbol: 'ITC.NS',        name: 'ITC'             },
  { symbol: 'AXISBANK.NS',   name: 'Axis Bank'       },
  { symbol: 'MARUTI.NS',     name: 'Maruti Suzuki'   },
  { symbol: 'SUNPHARMA.NS',  name: 'Sun Pharma'      },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance'   },
  { symbol: 'TITAN.NS',      name: 'Titan'           },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints'    },
  { symbol: 'TECHM.NS',      name: 'Tech Mahindra'   },
  { symbol: 'HINDUNILVR.NS', name: 'HUL'             },
  { symbol: 'WIPRO.NS',      name: 'Wipro'           },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors'     },
];

async function fetchChange(symbol: string, name: string): Promise<Mover | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price: number = meta.regularMarketPrice ?? 0;
    const prev: number  = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const changePercent = prev !== 0 ? ((price - prev) / prev) * 100 : 0;
    return { symbol: symbol.replace('.NS', ''), name, price, changePercent };
  } catch {
    return null;
  }
}

export async function GET() {
  // Fetch all stocks concurrently — v8 chart endpoint is the same one used for market prices
  const results = await Promise.all(STOCKS.map(s => fetchChange(s.symbol, s.name)));
  const movers  = results.filter((m): m is Mover => m !== null);

  movers.sort((a, b) => b.changePercent - a.changePercent);

  const gainers = movers.slice(0, 5);
  const losers  = [...movers].reverse().slice(0, 5);

  return NextResponse.json({ gainers, losers });
}
