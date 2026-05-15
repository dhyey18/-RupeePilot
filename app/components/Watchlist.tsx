'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WatchlistItem, AssetClass } from '@/app/lib/types';
import { Plus, Trash2, Bell, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'rp-watchlist-v2';

const PRESETS: Omit<WatchlistItem, 'addedAt'>[] = [
  { id: 'nsei', symbol: '^NSEI', name: 'NIFTY 50', category: 'equity' },
  { id: 'bsesn', symbol: '^BSESN', name: 'SENSEX', category: 'equity' },
  { id: 'nsebank', symbol: '^NSEBANK', name: 'Bank Nifty', category: 'equity' },
  { id: 'goldbees', symbol: 'GOLDBEES.NS', name: 'Gold ETF (GOLDBEES)', category: 'gold' },
  { id: 'silverbees', symbol: 'SILVERBEES.NS', name: 'Silver ETF (SilverBees)', category: 'gold' },
  { id: 'inr', symbol: 'INR=X', name: 'USD/INR', category: 'cash' },
];

const categoryColors: Record<AssetClass, string> = {
  equity: '#6366f1',
  gold: '#f59e0b',
  debt: '#10b981',
  cash: '#94a3b8',
  reit: '#f97316',
  government: '#8b5cf6',
};

function loadItems(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [enriched, setEnriched] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ symbol: '', name: '', category: 'equity' as AssetClass, alertAbove: '', alertBelow: '' });

  useEffect(() => {
    const stored = loadItems();
    if (stored.length === 0) {
      const defaults = PRESETS.map((p) => ({ ...p, addedAt: new Date().toISOString() }));
      setItems(defaults);
      saveItems(defaults);
    } else {
      setItems(stored);
    }
  }, []);

  const refreshQuotes = useCallback(async (list: WatchlistItem[]) => {
    if (list.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list),
      });
      if (res.ok) {
        const data: WatchlistItem[] = await res.json();
        setEnriched(data);
      }
    } catch {
      // silently keep stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) refreshQuotes(items);
  }, [items, refreshQuotes]);

  function addItem() {
    if (!form.symbol.trim() || !form.name.trim()) return;
    const newItem: WatchlistItem = {
      id: crypto.randomUUID(),
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category,
      alertAbove: form.alertAbove ? parseFloat(form.alertAbove) : undefined,
      alertBelow: form.alertBelow ? parseFloat(form.alertBelow) : undefined,
      addedAt: new Date().toISOString(),
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveItems(updated);
    setForm({ symbol: '', name: '', category: 'equity', alertAbove: '', alertBelow: '' });
    setShowAdd(false);
  }

  function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveItems(updated);
    setEnriched((e) => e.filter((i) => i.id !== id));
  }

  const displayItems = enriched.length > 0
    ? items.map((item) => ({ ...item, quote: enriched.find((e) => e.id === item.id)?.quote }))
    : items;

  const checkAlert = (item: WatchlistItem) => {
    const price = item.quote?.price;
    if (!price) return null;
    if (item.alertAbove && price > item.alertAbove) return 'above';
    if (item.alertBelow && price < item.alertBelow) return 'below';
    return null;
  };

  return (
    <div className="watchlist-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Watchlist</h1>
          <p className="page-subtitle">Track your favourite assets</p>
        </div>
        <div className="watchlist-actions">
          <button onClick={() => refreshQuotes(items)} className="refresh-btn" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button onClick={() => setShowAdd((s) => !s)} className="add-btn">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="add-form">
          <h3 className="add-form-title">Add to Watchlist</h3>
          <div className="add-form-grid">
            <div className="form-field">
              <label>Symbol (Yahoo Finance)</label>
              <input
                placeholder="e.g. ^NSEI, HDFCBANK.NS, GOLDBEES.NS"
                value={form.symbol}
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label>Display Name</label>
              <input
                placeholder="e.g. NIFTY 50"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AssetClass }))}
                className="form-input"
              >
                <option value="equity">Equity</option>
                <option value="gold">Gold</option>
                <option value="debt">Debt</option>
                <option value="reit">REIT</option>
                <option value="government">Government</option>
                <option value="cash">Cash / FX</option>
              </select>
            </div>
            <div className="form-field">
              <label>Alert Above (optional)</label>
              <input
                type="number"
                placeholder="Price threshold"
                value={form.alertAbove}
                onChange={(e) => setForm((f) => ({ ...f, alertAbove: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label>Alert Below (optional)</label>
              <input
                type="number"
                placeholder="Price threshold"
                value={form.alertBelow}
                onChange={(e) => setForm((f) => ({ ...f, alertBelow: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>
          <div className="add-form-btns">
            <button onClick={addItem} className="rec-btn">Add</button>
            <button onClick={() => setShowAdd(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <div className="watchlist-table-wrap">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th className="wl-col-cat">Category</th>
              <th>Price</th>
              <th>Change</th>
              <th className="wl-col-alert">Alert</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => {
              const alert = checkAlert(item);
              const up = (item.quote?.changePercent ?? 0) > 0;
              const down = (item.quote?.changePercent ?? 0) < 0;
              return (
                <tr key={item.id} className={alert ? `alert-row alert-${alert}` : ''}>
                  <td>
                    <div className="wl-asset-name">{item.name}</div>
                    <div className="wl-symbol">{item.symbol}</div>
                  </td>
                  <td className="wl-col-cat">
                    <span className="wl-cat" style={{ background: categoryColors[item.category] + '22', color: categoryColors[item.category] }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="wl-price">
                    {item.quote ? (
                      `₹${item.quote.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                    ) : (
                      <span className="loading-dot">—</span>
                    )}
                  </td>
                  <td>
                    {item.quote ? (
                      <span className={`wl-change ${up ? 'change-up' : down ? 'change-down' : 'change-flat'}`}>
                        {up ? <TrendingUp size={13} /> : down ? <TrendingDown size={13} /> : <Minus size={13} />}
                        {up ? '+' : ''}{item.quote.changePercent.toFixed(2)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="wl-col-alert">
                    {(item.alertAbove || item.alertBelow) ? (
                      <div className={`alert-chip ${alert ? 'alert-triggered' : ''}`}>
                        <Bell size={12} />
                        {alert ? `Triggered (${alert})` : 'Set'}
                      </div>
                    ) : (
                      <span className="no-alert">—</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => removeItem(item.id)} className="remove-btn" aria-label="Remove">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayItems.length === 0 && (
          <div className="empty-state">No assets in your watchlist yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}
