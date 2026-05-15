export type AssetClass = 'equity' | 'gold' | 'debt' | 'cash' | 'reit' | 'government';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export interface MarketSnapshot {
  nifty50: MarketQuote;
  sensex: MarketQuote;
  bankNifty: MarketQuote;
  gold: MarketQuote;
  silver: MarketQuote;
  usdinr: MarketQuote;
  timestamp: string;
}

export interface AssetScore {
  id: string;
  name: string;
  category: AssetClass;
  score: number;
  recommendation: 'Strong Buy' | 'Buy' | 'Accumulate' | 'Hold' | 'Neutral';
  reason: string;
  color: string;
}

export interface AllocationSuggestion {
  asset: string;
  assetId: string;
  amount: number;
  percentage: number;
  category: AssetClass;
  reason: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  category: AssetClass;
  alertAbove?: number;
  alertBelow?: number;
  addedAt: string;
  quote?: MarketQuote;
}

export interface EconomicIndicator {
  name: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  favoredAsset: AssetClass | null;
  note: string;
}

export interface AhmedabadBullionRate {
  gold24k_10g: number;
  gold22k_10g: number;
  silver_10g: number;
  silver_kg: number;
  goldChangePercent: number;
  silverChangePercent: number;
  usdinr: number;
  timestamp: string;
}

export type BriefingType = 'positive' | 'negative' | 'neutral' | 'action' | 'warning';

export interface BriefingPoint {
  type: BriefingType;
  headline: string;
  detail: string;
}

export interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  providerPublishTime: number;
}

export type OpportunityType = 'equity' | 'gold' | 'fd' | 'fx' | 'debt';

export interface Opportunity {
  id: string;
  title: string;
  detail: string;
  type: OpportunityType;
  urgency: 'high' | 'medium' | 'low';
  action: string;
}

export type VerdictAction = 'invest_now' | 'wait' | 'hold' | 'rebalance' | 'sip_day';

export interface TodayVerdict {
  greeting: string;
  headline: string;
  subtext: string;
  action: VerdictAction;
  actionLabel: string;
  actionDetail: string;
  confidenceScore: number;
  marketMood: 'bullish' | 'bearish' | 'sideways' | 'volatile';
}
