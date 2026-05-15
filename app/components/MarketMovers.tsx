'use client';

import { useState, useEffect } from 'react';
import type { Mover } from '@/app/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

function priceFmt(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
}

function MoverRow({ m, isGainer }: { m: Mover; isGainer: boolean }) {
  const pct = Math.abs(m.changePercent).toFixed(2);
  return (
    <div className="mover-row">
      <div className="mover-info">
        <span className="mover-name">{m.name}</span>
        <span className="mover-symbol">{m.symbol}</span>
      </div>
      <div className="mover-right">
        <span className="mover-price">₹{priceFmt(m.price)}</span>
        <span className={`mover-pct ${isGainer ? 'change-up' : 'change-down'}`}>
          {isGainer ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isGainer ? '+' : '-'}{pct}%
        </span>
      </div>
    </div>
  );
}

export default function MarketMovers() {
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers]   = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/movers')
      .then(r => r.json())
      .then(d => { setGainers(d.gainers ?? []); setLosers(d.losers ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="movers-card">
      <div className="movers-col">
        <div className="movers-col-header movers-header-gain">
          <TrendingUp size={14} />
          <span>Top Gainers</span>
        </div>
        {loading
          ? [1,2,3].map(i => <div key={i} className="mover-skeleton" />)
          : gainers.length === 0
            ? <p className="movers-empty">No data</p>
            : gainers.map(m => <MoverRow key={m.symbol} m={m} isGainer />)
        }
      </div>

      <div className="movers-divider" />

      <div className="movers-col">
        <div className="movers-col-header movers-header-loss">
          <TrendingDown size={14} />
          <span>Top Losers</span>
        </div>
        {loading
          ? [1,2,3].map(i => <div key={i} className="mover-skeleton" />)
          : losers.length === 0
            ? <p className="movers-empty">No data</p>
            : losers.map(m => <MoverRow key={m.symbol} m={m} isGainer={false} />)
        }
      </div>
    </div>
  );
}
