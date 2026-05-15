'use client';

import type { MarketSnapshot } from '@/app/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function fmtINR(n: number, compact = false) {
  if (compact && n >= 10000) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
  }
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
}

function Tick({ label, price, pct }: { label: string; price: number; pct: number }) {
  const up = pct > 0;
  const down = pct < 0;
  return (
    <div className="ticker-item">
      <span className="ticker-label">{label}</span>
      <span className="ticker-price">₹{fmtINR(price, true)}</span>
      <span className={`ticker-pct ${up ? 'change-up' : down ? 'change-down' : 'change-flat'}`}>
        {up ? <TrendingUp size={12} /> : down ? <TrendingDown size={12} /> : <Minus size={12} />}
        {up ? '+' : ''}{pct.toFixed(2)}%
      </span>
    </div>
  );
}

export default function MarketTicker({ snapshot }: { snapshot: MarketSnapshot }) {
  return (
    <div className="market-ticker">
      <Tick label="NIFTY 50" price={snapshot.nifty50.price} pct={snapshot.nifty50.changePercent} />
      <span className="ticker-sep" />
      <Tick label="SENSEX" price={snapshot.sensex.price} pct={snapshot.sensex.changePercent} />
      <span className="ticker-sep" />
      <Tick label="Bank Nifty" price={snapshot.bankNifty.price} pct={snapshot.bankNifty.changePercent} />
      <span className="ticker-sep" />
      <Tick label="USD/INR" price={snapshot.usdinr.price} pct={snapshot.usdinr.changePercent} />
    </div>
  );
}
