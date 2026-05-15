'use client';

import type { TodayVerdict as TVerdictType } from '@/app/lib/types';
import { TrendingUp, TrendingDown, Minus, Zap, Clock, BarChart2 } from 'lucide-react';

const moodConfig = {
  bullish: { label: 'Bullish', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  bearish: { label: 'Bearish', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  sideways: { label: 'Sideways', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  volatile: { label: 'Volatile', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
};

const actionConfig = {
  invest_now: { icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  hold: { icon: Minus, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  wait: { icon: Clock, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  rebalance: { icon: BarChart2, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  sip_day: { icon: Zap, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
};

export default function TodayVerdictCard({ verdict, date }: { verdict: TVerdictType; date: string }) {
  const mood = moodConfig[verdict.marketMood];
  const act = actionConfig[verdict.action];
  const ActionIcon = act.icon;

  return (
    <div className="verdict-card">
      <div className="verdict-top">
        <div className="verdict-greeting">
          <span className="greeting-text">{verdict.greeting}</span>
          <span className="verdict-date">{date}</span>
        </div>
        <span className="mood-chip" style={{ color: mood.color, background: mood.bg }}>
          {mood.label} Market
        </span>
      </div>

      <h2 className="verdict-headline">{verdict.headline}</h2>
      <p className="verdict-subtext">{verdict.subtext}</p>

      <div className="verdict-action" style={{ background: act.bg, borderColor: act.color + '44' }}>
        <div className="verdict-action-icon" style={{ color: act.color }}>
          <ActionIcon size={20} />
        </div>
        <div className="verdict-action-body">
          <span className="verdict-action-label" style={{ color: act.color }}>{verdict.actionLabel}</span>
          <span className="verdict-action-detail">{verdict.actionDetail}</span>
        </div>
        <div className="verdict-confidence">
          <span className="confidence-num" style={{ color: act.color }}>{verdict.confidenceScore}</span>
          <span className="confidence-label">/ 100</span>
        </div>
      </div>
    </div>
  );
}
