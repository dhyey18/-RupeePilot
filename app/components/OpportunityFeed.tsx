'use client';

import type { Opportunity } from '@/app/lib/types';
import { TrendingUp, TrendingDown, Landmark, DollarSign, Zap } from 'lucide-react';

const TYPE_META: Record<Opportunity['type'], { label: string; color: string; bg: string }> = {
  equity: { label: 'EQUITY',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  gold:   { label: 'GOLD',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  fd:     { label: 'FD',      color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  fx:     { label: 'FOREX',   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'  },
  debt:   { label: 'DEBT',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

const URGENCY_META = {
  high:   { label: 'HIGH',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  medium: { label: 'ACT NOW',color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  low:    { label: 'NOTE',   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

function TypeIcon({ type }: { type: Opportunity['type'] }) {
  const props = { size: 16 };
  if (type === 'equity') return <TrendingUp {...props} />;
  if (type === 'gold')   return <TrendingDown {...props} />;
  if (type === 'fd')     return <Landmark {...props} />;
  if (type === 'fx')     return <DollarSign {...props} />;
  return <Zap {...props} />;
}

export default function OpportunityFeed({ opportunities }: { opportunities: Opportunity[] }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div className="opp-section">
      <div className="opp-header">
        <Zap size={14} className="opp-header-icon" />
        <span className="section-title" style={{ margin: 0 }}>Live Opportunities</span>
        <span className="opp-live-dot" />
        <span className="opp-live-label">Live</span>
      </div>

      <div className="opp-grid">
        {opportunities.map(opp => {
          const tm = TYPE_META[opp.type];
          const um = URGENCY_META[opp.urgency];
          return (
            <div key={opp.id} className="opp-card">
              <div className="opp-card-top">
                <span className="opp-type-tag" style={{ color: tm.color, background: tm.bg }}>
                  <TypeIcon type={opp.type} />
                  {tm.label}
                </span>
                <span className="opp-urgency" style={{ color: um.color, background: um.bg }}>
                  {um.label}
                </span>
              </div>
              <p className="opp-title">{opp.title}</p>
              <p className="opp-detail">{opp.detail}</p>
              <div className="opp-action">{opp.action}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
