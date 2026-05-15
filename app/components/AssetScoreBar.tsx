'use client';

import type { AssetScore } from '@/app/lib/types';

const recColor: Record<AssetScore['recommendation'], string> = {
  'Strong Buy': '#22c55e',
  'Buy': '#86efac',
  'Accumulate': '#fbbf24',
  'Hold': '#94a3b8',
  'Neutral': '#64748b',
};

export default function AssetScoreBar({ asset }: { asset: AssetScore }) {
  const color = recColor[asset.recommendation];
  return (
    <div className="score-row">
      <div className="score-meta">
        <span className="score-name">{asset.name}</span>
        <span className="score-rec" style={{ color }}>{asset.recommendation}</span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${asset.score}%`, background: asset.color }}
        />
      </div>
      <div className="score-footer">
        <span className="score-reason">{asset.reason}</span>
        <span className="score-number">{asset.score}/100</span>
      </div>
    </div>
  );
}
