'use client';

import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';

const LOAN_PRESETS = [
  { label: 'Home Loan',     rate: 8.5,  years: 20, color: '#6366f1' },
  { label: 'Car Loan',      rate: 9.5,  years: 5,  color: '#f59e0b' },
  { label: 'Personal Loan', rate: 14.0, years: 3,  color: '#ef4444' },
  { label: 'Gold Loan',     rate: 10.0, years: 2,  color: '#f59e0b' },
];

function calcEMI(principal: number, annualRate: number, years: number) {
  const months = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) return { emi: principal / months, total: principal, interest: 0 };
  const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  const interest = total - principal;
  return { emi, total, interest };
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function EMICalculator() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [principal, setPrincipal] = useState('2500000');
  const [rate, setRate] = useState(String(LOAN_PRESETS[0].rate));
  const [years, setYears] = useState(LOAN_PRESETS[0].years);

  const p = Math.max(1000, parseFloat(principal) || 0);
  const r = Math.max(0.1, parseFloat(rate) || 0);
  const { emi, total, interest } = useMemo(() => calcEMI(p, r, years), [p, r, years]);
  const principalPct = Math.round((p / total) * 100);
  const interestPct  = 100 - principalPct;

  function applyPreset(idx: number) {
    setPresetIdx(idx);
    setRate(String(LOAN_PRESETS[idx].rate));
    setYears(LOAN_PRESETS[idx].years);
  }

  return (
    <div className="emi-card">
      <div className="emi-header">
        <Calculator size={15} className="emi-icon" />
        <h2 className="section-title" style={{ margin: 0 }}>EMI Calculator</h2>
      </div>

      <div className="emi-presets">
        {LOAN_PRESETS.map((p, i) => (
          <button
            key={p.label}
            className={`emi-preset-btn ${i === presetIdx ? 'emi-preset-active' : ''}`}
            style={i === presetIdx ? { borderColor: p.color, color: p.color } : {}}
            onClick={() => applyPreset(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="emi-fields">
        <div className="emi-field">
          <label>Loan Amount</label>
          <div className="emi-input-wrap">
            <span className="emi-prefix">₹</span>
            <input
              type="number"
              value={principal}
              onChange={e => setPrincipal(e.target.value)}
              className="emi-input"
              min={10000}
              step={50000}
            />
          </div>
        </div>
        <div className="emi-field">
          <label>Interest Rate (% p.a.)</label>
          <div className="emi-input-wrap">
            <input
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              className="emi-input"
              min={0.1}
              max={36}
              step={0.1}
            />
            <span className="emi-suffix">%</span>
          </div>
        </div>
        <div className="emi-field">
          <label>Tenure: <strong>{years} years</strong></label>
          <input
            type="range"
            min={1} max={30} value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="sip-range"
          />
          <div className="sip-range-labels"><span>1 yr</span><span>30 yr</span></div>
        </div>
      </div>

      <div className="emi-result-card">
        <div className="emi-result-main">
          <span className="emi-result-label">Monthly EMI</span>
          <span className="emi-result-value">{fmt(emi)}</span>
        </div>
        <div className="emi-result-breakdown">
          <div className="emi-bd-item">
            <span className="emi-bd-label">Total Payment</span>
            <span className="emi-bd-val">{fmt(total)}</span>
          </div>
          <div className="sip-breakdown-sep" />
          <div className="emi-bd-item">
            <span className="emi-bd-label">Total Interest</span>
            <span className="emi-bd-val" style={{ color: '#ef4444' }}>{fmt(interest)}</span>
          </div>
        </div>
      </div>

      <div className="emi-split">
        <div className="emi-split-bar">
          <div className="emi-split-principal" style={{ width: `${principalPct}%` }} />
          <div className="emi-split-interest" style={{ width: `${interestPct}%` }} />
        </div>
        <div className="emi-split-legend">
          <span className="emi-legend-item emi-legend-principal">Principal {principalPct}%</span>
          <span className="emi-legend-item emi-legend-interest">Interest {interestPct}%</span>
        </div>
      </div>
    </div>
  );
}
