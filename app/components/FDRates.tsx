'use client';

import { useState } from 'react';
import { FD_RATES } from '@/app/lib/fdRates';
import { Landmark } from 'lucide-react';

const TENURES = ['1 Year', '2 Years', '5 Years'] as const;

function RateBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round(((value - 5) / (max - 5)) * 100);
  return (
    <div className="fd-rate-bar-track">
      <div className="fd-rate-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function FDRates() {
  const [tenure, setTenure] = useState<(typeof TENURES)[number]>('2 Years');

  const rows = FD_RATES.map(fd => {
    const t = fd.tenures.find(t => t.label === tenure)!;
    return { ...fd, general: t.general, senior: t.senior };
  }).sort((a, b) => b.general - a.general);

  const maxGeneral = Math.max(...rows.map(r => r.general));
  const maxSenior  = Math.max(...rows.map(r => r.senior));
  const bestBank   = rows[0]?.bank;

  return (
    <div className="fd-card">
      <div className="fd-header">
        <div className="fd-header-left">
          <Landmark size={15} className="fd-header-icon" />
          <h2 className="section-title" style={{ margin: 0 }}>FD Rate Comparison</h2>
        </div>
        <span className="fd-note">Indicative · May 2026</span>
      </div>

      <div className="fd-tenure-tabs">
        {TENURES.map(t => (
          <button
            key={t}
            className={`fd-tab ${tenure === t ? 'fd-tab-active' : ''}`}
            onClick={() => setTenure(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="fd-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              <th className="fd-th-bank">Bank</th>
              <th className="fd-th-rate">General</th>
              <th className="fd-th-rate fd-th-senior">Senior (60+)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((fd, idx) => {
              const isTop = fd.bank === bestBank;
              return (
                <tr key={fd.bank} className={isTop ? 'fd-row-best' : ''}>
                  <td className="fd-td-bank">
                    <div className="fd-bank-cell">
                      <span className="fd-bank-dot" style={{ background: fd.color }} />
                      <div className="fd-bank-info">
                        <span className="fd-bank-name">
                          {fd.shortName}
                          {isTop && <span className="fd-best-badge">Best</span>}
                        </span>
                        {fd.special && <span className="fd-bank-note">{fd.special}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="fd-td-rate">
                    <span className="fd-rate" style={{ color: isTop ? '#22c55e' : 'var(--text)' }}>
                      {fd.general.toFixed(2)}%
                    </span>
                    <RateBar value={fd.general} max={maxGeneral} />
                  </td>
                  <td className="fd-td-rate fd-td-senior">
                    <span className="fd-rate fd-rate-senior">
                      {fd.senior.toFixed(2)}%
                    </span>
                    <RateBar value={fd.senior} max={maxSenior} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="fd-disclaimer">
        TDS applies above ₹40,000/year (₹50,000 for seniors). Post Office TD is govt-backed; 5-yr qualifies for 80C deduction. Verify with bank before investing.
      </p>
    </div>
  );
}
