import type {
  MarketQuote, MarketSnapshot, AssetScore, AssetClass,
  EconomicIndicator, AhmedabadBullionRate, BriefingPoint, TodayVerdict,
} from './types';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchQuote(symbol: string, name: string, currency: string): Promise<MarketQuote> {
  const res = await fetch(`${YAHOO_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`, {
    next: { revalidate: 300 },
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
  const json = await res.json();
  const meta = json.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No data for ${symbol}`);
  const price: number = meta.regularMarketPrice ?? 0;
  const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prev;
  const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
  return { symbol, name, price, change, changePercent, currency };
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const [nifty50, sensex, bankNifty, gold, silver, usdinr] = await Promise.all([
    fetchQuote('^NSEI', 'NIFTY 50', 'INR'),
    fetchQuote('^BSESN', 'SENSEX', 'INR'),
    fetchQuote('^NSEBANK', 'Bank Nifty', 'INR'),
    fetchQuote('GOLDBEES.NS', 'Gold ETF (GOLDBEES)', 'INR'),
    fetchQuote('SILVERBEES.NS', 'Silver ETF (SilverBees)', 'INR'),
    fetchQuote('INR=X', 'USD/INR', 'INR'),
  ]);
  return { nifty50, sensex, bankNifty, gold, silver, usdinr, timestamp: new Date().toISOString() };
}

// Calculates Ahmedabad local bullion rates from COMEX + USDINR
// Import duty structure: 10% customs + 2.5% AIDC + 1.1% SWS on duties + 3% GST ≈ 15.5%
export async function getAhmedabadBullionRates(): Promise<AhmedabadBullionRate> {
  const [goldUSD, silverUSD, usdinrQuote] = await Promise.all([
    fetchQuote('GC=F', 'COMEX Gold', 'USD'),
    fetchQuote('SI=F', 'COMEX Silver', 'USD'),
    fetchQuote('INR=X', 'USD/INR', 'INR'),
  ]);

  const usdinr = usdinrQuote.price;
  const TROY_OZ_TO_G = 31.1035;
  const DUTY_FACTOR = 1.155; // Indian import duty + GST
  const AHMEDABAD_PREMIUM_10G = 350; // local market premium in Ahmedabad

  const goldPerGramINR = (goldUSD.price / TROY_OZ_TO_G) * usdinr;
  const silverPerGramINR = (silverUSD.price / TROY_OZ_TO_G) * usdinr;

  const gold24k_10g = Math.round(goldPerGramINR * 10 * DUTY_FACTOR + AHMEDABAD_PREMIUM_10G);
  const gold22k_10g = Math.round(gold24k_10g * (22 / 24));
  const silver_10g = Math.round(silverPerGramINR * 10 * DUTY_FACTOR);
  const silver_kg = Math.round(silverPerGramINR * 1000 * DUTY_FACTOR);

  return {
    gold24k_10g,
    gold22k_10g,
    silver_10g,
    silver_kg,
    goldChangePercent: goldUSD.changePercent,
    silverChangePercent: silverUSD.changePercent,
    usdinr,
    timestamp: new Date().toISOString(),
  };
}

export function scoreAssets(snapshot: MarketSnapshot): AssetScore[] {
  const niftyChange = snapshot.nifty50.changePercent;
  const goldChange = snapshot.gold.changePercent;

  const niftyScore = Math.min(100, Math.max(0, 65 + niftyChange * -8));
  const sensexScore = Math.min(100, Math.max(0, 63 + snapshot.sensex.changePercent * -8));
  const midCapScore = Math.min(100, Math.max(0, 55 + niftyChange * -5));
  const goldScore = Math.min(100, Math.max(0, 60 + goldChange * -6));
  const liquidScore = 58;
  const debtScore = 55;
  const reitScore = 62;

  const toRec = (s: number): AssetScore['recommendation'] => {
    if (s >= 80) return 'Strong Buy';
    if (s >= 68) return 'Buy';
    if (s >= 55) return 'Accumulate';
    if (s >= 45) return 'Hold';
    return 'Neutral';
  };

  return ([
    {
      id: 'nifty50',
      name: 'NIFTY 50 Index Fund',
      category: 'equity' as AssetClass,
      score: Math.round(niftyScore),
      recommendation: toRec(niftyScore),
      reason:
        niftyChange < -1
          ? 'Market dip — attractive entry for long-term investors'
          : niftyChange > 1
          ? 'Momentum is positive; valuations slightly stretched'
          : 'Sideways market — steady accumulation makes sense',
      color: '#6366f1',
    },
    {
      id: 'sensex',
      name: 'Sensex Index Fund',
      category: 'equity' as AssetClass,
      score: Math.round(sensexScore),
      recommendation: toRec(sensexScore),
      reason: 'Broad market exposure; closely tracks NIFTY',
      color: '#8b5cf6',
    },
    {
      id: 'midcap',
      name: 'Mid Cap Fund',
      category: 'equity' as AssetClass,
      score: Math.round(midCapScore),
      recommendation: toRec(midCapScore),
      reason: 'Higher growth potential; suitable for 5+ year horizon',
      color: '#a78bfa',
    },
    {
      id: 'gold',
      name: 'Gold ETF',
      category: 'gold' as AssetClass,
      score: Math.round(goldScore),
      recommendation: toRec(goldScore),
      reason:
        goldChange < -1
          ? 'Gold pulled back — good diversification opportunity'
          : 'Gold is steady; useful hedge against equity volatility',
      color: '#f59e0b',
    },
    {
      id: 'liquid',
      name: 'Liquid Fund',
      category: 'debt' as AssetClass,
      score: liquidScore,
      recommendation: 'Accumulate',
      reason: 'Safe parking for short-term cash; better than savings account',
      color: '#10b981',
    },
    {
      id: 'debt',
      name: 'Debt Fund',
      category: 'debt' as AssetClass,
      score: debtScore,
      recommendation: 'Accumulate',
      reason: 'Stable returns; suitable for 1–3 year goals',
      color: '#34d399',
    },
    {
      id: 'reit',
      name: 'REIT',
      category: 'reit' as AssetClass,
      score: reitScore,
      recommendation: toRec(reitScore),
      reason: 'Real estate exposure with regular dividend yield',
      color: '#f97316',
    },
  ] as AssetScore[]).sort((a, b) => b.score - a.score);
}

export function generateTodayVerdict(snapshot: MarketSnapshot, scores: AssetScore[]): TodayVerdict {
  const niftyChange = snapshot.nifty50.changePercent;
  const goldChange = snapshot.gold.changePercent;
  const topScore = scores[0];
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  let marketMood: TodayVerdict['marketMood'] = 'sideways';
  if (niftyChange > 1.5) marketMood = 'bullish';
  else if (niftyChange < -1.5) marketMood = 'bearish';
  else if (Math.abs(niftyChange) < 0.5 && Math.abs(snapshot.sensex.changePercent) < 0.5) marketMood = 'sideways';
  else marketMood = 'sideways';

  let headline = '';
  let subtext = '';
  let action: TodayVerdict['action'] = 'hold';
  let actionLabel = '';
  let actionDetail = '';
  let confidenceScore = 65;

  if (niftyChange < -1.5) {
    headline = 'Market is down — good time to invest';
    subtext = `NIFTY fell ${Math.abs(niftyChange).toFixed(1)}% today. Dips like this are buying opportunities for long-term investors.`;
    action = 'invest_now';
    actionLabel = 'Invest Today';
    actionDetail = `Add to NIFTY 50 Index Fund. Buying during dips builds wealth over time.`;
    confidenceScore = 82;
  } else if (niftyChange > 1.5) {
    headline = 'Markets are rallying — stay the course';
    subtext = `NIFTY is up ${niftyChange.toFixed(1)}% today. Let your existing investments run. Avoid chasing the rally.`;
    action = 'hold';
    actionLabel = 'Stay Invested';
    actionDetail = 'No urgent action needed. Your SIPs will buy at higher price today — that is fine for the long term.';
    confidenceScore = 70;
  } else if (goldChange < -1.5) {
    headline = 'Gold is cheaper today — consider buying';
    subtext = `Gold dropped ${Math.abs(goldChange).toFixed(1)}%. If your gold allocation is below target, today is a good opportunity.`;
    action = 'invest_now';
    actionLabel = 'Buy Gold ETF';
    actionDetail = 'Add to Gold ETF or check Ahmedabad rates below if you prefer physical gold.';
    confidenceScore = 75;
  } else if (topScore.score >= 75) {
    headline = `${topScore.name} looks attractive`;
    subtext = topScore.reason;
    action = 'invest_now';
    actionLabel = 'Consider Investing';
    actionDetail = `Score: ${topScore.score}/100. ${topScore.reason}`;
    confidenceScore = topScore.score;
  } else {
    headline = 'Quiet market day — keep your SIP running';
    subtext = 'No major moves today. The best thing you can do is continue your regular SIP and stay invested.';
    action = 'sip_day';
    actionLabel = 'Continue SIP';
    actionDetail = 'Consistent SIP through all market conditions is the most powerful wealth-building tool.';
    confidenceScore = 68;
  }

  return { greeting, headline, subtext, action, actionLabel, actionDetail, confidenceScore, marketMood };
}

export function generateBriefingPoints(snapshot: MarketSnapshot, scores: AssetScore[]): BriefingPoint[] {
  const points: BriefingPoint[] = [];
  const niftyChange = snapshot.nifty50.changePercent;
  const goldChange = snapshot.gold.changePercent;
  const usdinrChange = snapshot.usdinr.changePercent;

  // NIFTY insight
  if (Math.abs(niftyChange) > 0.3) {
    points.push({
      type: niftyChange > 0 ? 'positive' : 'negative',
      headline: `NIFTY 50 is ${niftyChange > 0 ? 'up' : 'down'} ${Math.abs(niftyChange).toFixed(2)}% today`,
      detail:
        niftyChange < -2
          ? 'Sharp fall — excellent time to add lump sum to index funds'
          : niftyChange < -0.5
          ? 'Minor dip — your SIP is buying at a discount today'
          : niftyChange > 2
          ? 'Strong rally — hold tight, do not sell in excitement'
          : 'Mild gain — market steady, continue regular investments',
    });
  }

  // Gold insight
  if (Math.abs(goldChange) > 0.5) {
    points.push({
      type: goldChange > 0 ? 'positive' : 'neutral',
      headline: `Gold ${goldChange > 0 ? 'gained' : 'fell'} ${Math.abs(goldChange).toFixed(2)}% today`,
      detail:
        goldChange < -1.5
          ? 'Good chance to add to your gold allocation at a lower price'
          : goldChange > 1.5
          ? 'Gold is acting as a hedge — your portfolio is protected'
          : 'Gold is moving slightly — check Ahmedabad rate before buying physical',
    });
  }

  // Rupee insight
  if (Math.abs(usdinrChange) > 0.3) {
    points.push({
      type: usdinrChange > 0 ? 'warning' : 'positive',
      headline: `Rupee ${usdinrChange > 0 ? 'weakened' : 'strengthened'} — USD/INR at ₹${snapshot.usdinr.price.toFixed(2)}`,
      detail:
        usdinrChange > 0
          ? 'Weak rupee makes imports costly and pushes gold prices higher in India'
          : 'Stronger rupee — import costs ease, good for equity markets',
    });
  }

  // Top opportunity
  const topAsset = scores[0];
  if (topAsset.score >= 70) {
    points.push({
      type: 'action',
      headline: `Best opportunity today: ${topAsset.name} (${topAsset.score}/100)`,
      detail: topAsset.reason,
    });
  }

  // Always add a long-term reminder
  points.push({
    type: 'neutral',
    headline: 'Your wealth is built over years, not days',
    detail: 'Daily market moves are noise. Keep your SIP running and review your portfolio monthly.',
  });

  return points.slice(0, 4);
}

export function getEconomicIndicators(): EconomicIndicator[] {
  return [
    {
      name: 'RBI Repo Rate',
      value: '6.50%',
      trend: 'neutral',
      favoredAsset: 'debt',
      note: 'Rate pause favors debt funds and bonds',
    },
    {
      name: 'CPI Inflation',
      value: '4.83%',
      trend: 'down',
      favoredAsset: 'equity',
      note: 'Easing inflation supports equity valuations',
    },
    {
      name: 'USD/INR',
      value: '85.2',
      trend: 'up',
      favoredAsset: 'gold',
      note: 'Weak rupee boosts domestic gold prices',
    },
    {
      name: 'FII Flow',
      value: 'Net Buying',
      trend: 'up',
      favoredAsset: 'equity',
      note: 'Foreign buying adds bullish sentiment',
    },
  ];
}
