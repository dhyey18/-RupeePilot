'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/app/components/ChatInterface';
import { Bot } from 'lucide-react';

export default function ChatPage() {
  const [marketContext, setMarketContext] = useState<string | undefined>();

  useEffect(() => {
    fetch('/api/market')
      .then(r => r.json())
      .then(d => {
        if (!d.snapshot) return;
        const s = d.snapshot;
        const b = d.bullion;
        const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
        const ctx = [
          `NIFTY 50: ₹${fmt(s.nifty50.price)} (${s.nifty50.changePercent > 0 ? '+' : ''}${s.nifty50.changePercent.toFixed(2)}%)`,
          `SENSEX: ₹${fmt(s.sensex.price)} (${s.sensex.changePercent > 0 ? '+' : ''}${s.sensex.changePercent.toFixed(2)}%)`,
          `Gold ETF: ₹${s.gold.price.toFixed(2)} (${s.gold.changePercent > 0 ? '+' : ''}${s.gold.changePercent.toFixed(2)}%)`,
          `USD/INR: ₹${s.usdinr.price.toFixed(2)}`,
          b ? `Ahmedabad Gold 24K: ₹${fmt(b.gold24k_10g)}/10g` : '',
          b ? `Ahmedabad Silver: ₹${fmt(b.silver_kg)}/kg` : '',
        ].filter(Boolean).join('\n');
        setMarketContext(ctx);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <div className="chat-page-title">
          <Bot size={20} />
          <h1>Ask RupeePilot</h1>
        </div>
        <p className="chat-page-sub">Your personal money advisor — ask anything about investing, saving, gold, FDs, tax, or loans</p>
      </div>
      <ChatInterface marketContext={marketContext} />
    </div>
  );
}
