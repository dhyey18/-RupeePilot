'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const PRESETS = [
  { label: 'NIFTY 50 Index', returns: 12, color: '#6366f1' },
  { label: 'Mid Cap Fund', returns: 14, color: '#8b5cf6' },
  { label: 'Debt Fund', returns: 7, color: '#10b981' },
  { label: 'Gold ETF', returns: 10, color: '#f59e0b' },
];

function calcSIP(monthly: number, annualRate: number, years: number) {
  const months = years * 12;
  const r = annualRate / 100 / 12;
  const futureValue = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const invested = monthly * months;
  const gains = futureValue - invested;
  return { futureValue, invested, gains };
}

function fmtCr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function buildChartData(monthly: number, rate: number, years: number) {
  const data = [];
  for (let y = 1; y <= years; y++) {
    const { futureValue, invested } = calcSIP(monthly, rate, y);
    data.push({ year: `Yr ${y}`, value: Math.round(futureValue), invested: Math.round(invested) });
  }
  return data;
}

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState('5000');
  const [years, setYears] = useState(10);
  const [presetIdx, setPresetIdx] = useState(0);

  const preset = PRESETS[presetIdx];
  const m = Math.max(100, parseInt(monthly) || 0);
  const { futureValue, invested, gains } = useMemo(() => calcSIP(m, preset.returns, years), [m, preset.returns, years]);
  const chartData = useMemo(() => buildChartData(m, preset.returns, years), [m, preset.returns, years]);
  const multiplier = (futureValue / invested).toFixed(1);

  return (
    <div className="sip-card">
      <div className="sip-header">
        <TrendingUp size={16} className="sip-icon" />
        <h2 className="section-title" style={{ margin: 0 }}>SIP Goal Planner</h2>
      </div>

      <div className="sip-controls">
        <div className="sip-field">
          <label>Monthly SIP amount</label>
          <div className="sip-input-wrap">
            <span className="sip-rupee">₹</span>
            <input
              type="number"
              value={monthly}
              min={100}
              step={500}
              onChange={e => setMonthly(e.target.value)}
              className="sip-input"
            />
          </div>
        </div>
        <div className="sip-field">
          <label>Duration: <strong>{years} years</strong></label>
          <input
            type="range"
            min={1} max={30} value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="sip-range"
          />
          <div className="sip-range-labels"><span>1 yr</span><span>30 yr</span></div>
        </div>
      </div>

      <div className="sip-presets">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            className={`sip-preset ${i === presetIdx ? 'sip-preset-active' : ''}`}
            style={i === presetIdx ? { borderColor: p.color, color: p.color } : {}}
            onClick={() => setPresetIdx(i)}
          >
            {p.label}
            <span className="sip-preset-rate">{p.returns}% p.a.</span>
          </button>
        ))}
      </div>

      <div className="sip-result">
        <div className="sip-result-main">
          <span className="sip-result-label">You will have</span>
          <span className="sip-result-value" style={{ color: preset.color }}>{fmtCr(futureValue)}</span>
          <span className="sip-result-sub">in {years} years · {multiplier}× your money</span>
        </div>
        <div className="sip-result-breakdown">
          <div className="sip-breakdown-item">
            <span className="sip-bd-label">Total Invested</span>
            <span className="sip-bd-val">{fmtCr(invested)}</span>
          </div>
          <div className="sip-breakdown-sep" />
          <div className="sip-breakdown-item">
            <span className="sip-bd-label">Gains (Est.)</span>
            <span className="sip-bd-val gains-green">{fmtCr(gains)}</span>
          </div>
        </div>
      </div>

      {years > 1 && (
        <div className="sip-chart">
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={preset.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={preset.color} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-3)' }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [fmtCr(Number(v ?? 0)), '']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-2)' }}
              />
              <Area type="monotone" dataKey="value" stroke={preset.color} strokeWidth={2} fill="url(#sipGrad)" name="Portfolio value" />
              <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={1.5} fill="url(#invGrad)" strokeDasharray="4 2" name="Amount invested" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="sip-note">
        Returns are estimated based on historical averages. Actual returns may vary. Start early — even ₹500/month makes a difference.
      </p>
    </div>
  );
}
