'use client';

import type { AhmedabadBullionRate } from '@/app/lib/types';
import { TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';

function fmtINR(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function ChangeChip({ pct }: { pct: number }) {
  const up = pct > 0;
  const down = pct < 0;
  return (
    <span className={`bullion-change ${up ? 'change-up' : down ? 'change-down' : 'change-flat'}`}>
      {up ? <TrendingUp size={11} /> : down ? <TrendingDown size={11} /> : <Minus size={11} />}
      {up ? '+' : ''}{pct.toFixed(2)}%
    </span>
  );
}

export default function BullionCard({ bullion }: { bullion: AhmedabadBullionRate }) {
  return (
    <div className="bullion-card">
      <div className="bullion-header">
        <div className="bullion-title">
          <MapPin size={14} />
          <span>Ahmedabad Bullion Rates</span>
        </div>
        <span className="bullion-source">COMEX + RBI FX + Indian duties</span>
      </div>

      <div className="bullion-grid">
        <div className="bullion-item gold-item">
          <div className="bullion-metal-label">
            <span className="metal-dot gold-dot" />
            Gold 24K
          </div>
          <div className="bullion-price">₹{fmtINR(bullion.gold24k_10g)}</div>
          <div className="bullion-unit">per 10g</div>
          <ChangeChip pct={bullion.goldChangePercent} />
        </div>

        <div className="bullion-item gold-item">
          <div className="bullion-metal-label">
            <span className="metal-dot gold-dot" />
            Gold 22K
          </div>
          <div className="bullion-price">₹{fmtINR(bullion.gold22k_10g)}</div>
          <div className="bullion-unit">per 10g</div>
          <ChangeChip pct={bullion.goldChangePercent} />
        </div>

        <div className="bullion-item silver-item">
          <div className="bullion-metal-label">
            <span className="metal-dot silver-dot" />
            Silver
          </div>
          <div className="bullion-price">₹{fmtINR(bullion.silver_10g)}</div>
          <div className="bullion-unit">per 10g</div>
          <ChangeChip pct={bullion.silverChangePercent} />
        </div>

        <div className="bullion-item silver-item">
          <div className="bullion-metal-label">
            <span className="metal-dot silver-dot" />
            Silver
          </div>
          <div className="bullion-price">₹{fmtINR(bullion.silver_kg)}</div>
          <div className="bullion-unit">per kg</div>
          <ChangeChip pct={bullion.silverChangePercent} />
        </div>
      </div>

      <div className="bullion-footer">
        USD/INR: ₹{bullion.usdinr.toFixed(2)} · Includes 10% customs + 3% GST + local premium
      </div>
    </div>
  );
}
