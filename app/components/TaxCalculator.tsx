'use client';

import { useState, useMemo } from 'react';
import { Receipt, CheckCircle } from 'lucide-react';

// FY 2025-26 tax slabs
function calcNewRegime(grossIncome: number): { tax: number; taxable: number } {
  const std = 75000;
  const taxable = Math.max(0, grossIncome - std);

  // If net income ≤ 12L, full rebate u/s 87A
  if (taxable <= 1200000) return { tax: 0, taxable };

  let tax = 0;
  const slabs = [
    [400000,  0.00],
    [800000,  0.05],
    [1200000, 0.10],
    [1600000, 0.15],
    [2000000, 0.20],
    [2400000, 0.25],
    [Infinity, 0.30],
  ] as [number, number][];

  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, limit) - prev;
    tax += slice * rate;
    prev = limit;
  }
  return { tax: Math.round(tax * 1.04), taxable }; // 4% cess
}

function calcOldRegime(
  grossIncome: number,
  deduction80C: number,
  deduction80D: number,
): { tax: number; taxable: number } {
  const std = 50000;
  const taxable = Math.max(0, grossIncome - std - Math.min(deduction80C, 150000) - Math.min(deduction80D, 25000));

  // Rebate 87A for income ≤ 5L
  const slabs = [
    [250000,  0.00],
    [500000,  0.05],
    [1000000, 0.20],
    [Infinity, 0.30],
  ] as [number, number][];

  let tax = 0, prev = 0;
  for (const [limit, rate] of slabs) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, limit) - prev;
    tax += slice * rate;
    prev = limit;
  }

  // Rebate: if taxable income ≤ 5L
  if (taxable <= 500000) tax = 0;

  return { tax: Math.round(tax * 1.04), taxable };
}

function fmtTax(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState('800000');
  const [d80C, setD80C] = useState('150000');
  const [d80D, setD80D] = useState('25000');

  const gross = Math.max(0, parseFloat(income) || 0);
  const c80C = Math.max(0, parseFloat(d80C) || 0);
  const c80D = Math.max(0, parseFloat(d80D) || 0);

  const newR = useMemo(() => calcNewRegime(gross), [gross]);
  const oldR = useMemo(() => calcOldRegime(gross, c80C, c80D), [gross, c80C, c80D]);

  const savings = oldR.tax - newR.tax;
  const betterRegime = savings >= 0 ? 'new' : 'old';

  return (
    <div className="tax-card">
      <div className="tax-header">
        <Receipt size={15} className="tax-icon" />
        <h2 className="section-title" style={{ margin: 0 }}>Tax Regime Comparator</h2>
        <span className="tax-fy-badge">FY 2025-26</span>
      </div>

      <div className="tax-inputs">
        <div className="emi-field">
          <label>Annual Gross Income</label>
          <div className="emi-input-wrap">
            <span className="emi-prefix">₹</span>
            <input
              type="number"
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="emi-input"
              step={50000}
            />
          </div>
        </div>
        <div className="emi-field">
          <label>80C Investments (max ₹1.5L)</label>
          <div className="emi-input-wrap">
            <span className="emi-prefix">₹</span>
            <input
              type="number"
              value={d80C}
              onChange={e => setD80C(e.target.value)}
              className="emi-input"
              max={150000}
              step={10000}
            />
          </div>
        </div>
        <div className="emi-field">
          <label>80D Health Insurance (max ₹25K)</label>
          <div className="emi-input-wrap">
            <span className="emi-prefix">₹</span>
            <input
              type="number"
              value={d80D}
              onChange={e => setD80D(e.target.value)}
              className="emi-input"
              max={25000}
              step={5000}
            />
          </div>
        </div>
      </div>

      <div className="tax-compare">
        <div className={`tax-regime-card ${betterRegime === 'new' ? 'tax-regime-winner' : ''}`}>
          {betterRegime === 'new' && <div className="tax-winner-badge"><CheckCircle size={11} /> Better choice</div>}
          <span className="tax-regime-name">New Regime</span>
          <span className="tax-regime-tax">{fmtTax(newR.tax)}</span>
          <span className="tax-regime-note">Std deduction ₹75K · No 80C/80D</span>
          {gross <= 1275000 && <span className="tax-regime-zero">Zero tax ✓</span>}
        </div>
        <div className={`tax-regime-card ${betterRegime === 'old' ? 'tax-regime-winner' : ''}`}>
          {betterRegime === 'old' && <div className="tax-winner-badge"><CheckCircle size={11} /> Better choice</div>}
          <span className="tax-regime-name">Old Regime</span>
          <span className="tax-regime-tax">{fmtTax(oldR.tax)}</span>
          <span className="tax-regime-note">Std ₹50K + 80C + 80D deductions</span>
        </div>
      </div>

      {Math.abs(savings) > 0 && (
        <div className={`tax-save-banner ${savings > 0 ? 'tax-save-positive' : 'tax-save-negative'}`}>
          {savings > 0
            ? `New regime saves you ${fmtTax(savings)} in tax this year`
            : `Old regime saves you ${fmtTax(Math.abs(savings))} — max your deductions`}
        </div>
      )}

      <p className="fd-disclaimer" style={{ marginTop: 0 }}>
        Includes 4% health & education cess. Old regime deductions: ₹50K standard + 80C (PPF/ELSS/LIC) + 80D (health insurance). Consult a CA for surcharge, HRA, and other deductions.
      </p>
    </div>
  );
}
