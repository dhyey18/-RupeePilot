'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  MarketSnapshot, AssetScore, EconomicIndicator,
  AhmedabadBullionRate, BriefingPoint, TodayVerdict, Opportunity,
} from '@/app/lib/types';
import MarketTicker from './MarketTicker';
import BullionCard from './BullionCard';
import TodayVerdictCard from './TodayVerdict';
import DailyBriefing from './DailyBriefing';
import AssetScoreBar from './AssetScoreBar';
import FDRates from './FDRates';
import SIPCalculator from './SIPCalculator';
import EMICalculator from './EMICalculator';
import TaxCalculator from './TaxCalculator';
import OpportunityFeed from './OpportunityFeed';
import MarketNews from './MarketNews';
import Link from 'next/link';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface MarketData {
  snapshot: MarketSnapshot;
  scores: AssetScore[];
  indicators: EconomicIndicator[];
  bullion: AhmedabadBullionRate;
  verdict: TodayVerdict;
  briefing: BriefingPoint[];
  opportunities: Opportunity[];
}

function todayString() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Dashboard() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [scoresOpen, setScoresOpen] = useState(false);
  const [emiOpen, setEmiOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error('Failed to load market data');
      const json: MarketData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <span className="topbar-title">RupeePilot</span>
        <div className="topbar-right">
          {lastUpdated && (
            <span className="topbar-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={fetchData} className="refresh-btn-sm" disabled={loading} aria-label="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner"><AlertCircle size={16} /> {error}</div>
      )}

      {loading && !data && (
        <div className="skeleton-stack">
          <div className="skeleton-hero" />
          <div className="skeleton-row">
            <div className="skeleton-half" />
            <div className="skeleton-half" />
          </div>
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}

      {data && (
        <>
          {/* 1. Today's AI Verdict */}
          <TodayVerdictCard verdict={data.verdict} date={todayString()} />

          {/* 2. Compact market ticker */}
          <MarketTicker snapshot={data.snapshot} />

          {/* 3. Live Investment Opportunities */}
          <OpportunityFeed opportunities={data.opportunities ?? []} />

          {/* 4. Bullion + Briefing */}
          <div className="two-col">
            <BullionCard bullion={data.bullion} />
            <DailyBriefing points={data.briefing} />
          </div>

          {/* 5. Market News */}
          <MarketNews />

          {/* 6. FD Rate Comparison */}
          <FDRates />

          {/* 7. SIP Calculator */}
          <SIPCalculator />

          {/* 8. Ask AI shortcut */}
          <Link href="/chat" className="ask-ai-banner">
            <MessageCircle size={18} />
            <div className="ask-ai-text">
              <span className="ask-ai-title">Have a money question?</span>
              <span className="ask-ai-sub">Ask RupeePilot AI — gold, FD, SIP, tax, loans, anything</span>
            </div>
            <span className="ask-ai-cta">Ask Now →</span>
          </Link>

          {/* 9. EMI Calculator — collapsible */}
          <div className="collapsible-section">
            <button className="collapsible-header" onClick={() => setEmiOpen(o => !o)}>
              <span className="section-title" style={{ margin: 0 }}>EMI Calculator</span>
              <div className="collapsible-right">
                <span className="collapsible-hint">Home, Car, Personal, Gold loans</span>
                {emiOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {emiOpen && (
              <div className="collapsible-body">
                <EMICalculator />
              </div>
            )}
          </div>

          {/* 10. Tax Calculator — collapsible */}
          <div className="collapsible-section">
            <button className="collapsible-header" onClick={() => setTaxOpen(o => !o)}>
              <span className="section-title" style={{ margin: 0 }}>Tax Regime Comparator</span>
              <div className="collapsible-right">
                <span className="collapsible-hint">Old vs New · FY 2025-26</span>
                {taxOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {taxOpen && (
              <div className="collapsible-body">
                <TaxCalculator />
              </div>
            )}
          </div>

          {/* 11. Asset Scores — collapsible */}
          <div className="collapsible-section">
            <button className="collapsible-header" onClick={() => setScoresOpen(o => !o)}>
              <span className="section-title" style={{ margin: 0 }}>Asset Scores</span>
              <div className="collapsible-right">
                <span className="collapsible-hint">
                  Top: {data.scores[0]?.name} ({data.scores[0]?.score}/100)
                </span>
                {scoresOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {scoresOpen && (
              <div className="collapsible-body scores-list">
                {data.scores.map(s => <AssetScoreBar key={s.id} asset={s} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
