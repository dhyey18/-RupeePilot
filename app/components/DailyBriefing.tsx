'use client';

import type { BriefingPoint } from '@/app/lib/types';

const typeConfig = {
  positive: { dot: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  negative: { dot: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  neutral: { dot: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)' },
  action: { dot: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
  warning: { dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
};

export default function DailyBriefing({ points }: { points: BriefingPoint[] }) {
  return (
    <div className="briefing-section">
      <h2 className="section-title">Today's Briefing</h2>
      <div className="briefing-list">
        {points.map((p, i) => {
          const cfg = typeConfig[p.type];
          return (
            <div
              key={i}
              className="briefing-item"
              style={{ background: cfg.bg, borderColor: cfg.border }}
            >
              <span className="briefing-dot" style={{ background: cfg.dot }} />
              <div className="briefing-text">
                <span className="briefing-headline">{p.headline}</span>
                <span className="briefing-detail">{p.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
