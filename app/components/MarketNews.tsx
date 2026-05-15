'use client';

import { useState, useEffect } from 'react';
import type { NewsItem } from '@/app/lib/types';
import { Newspaper, ExternalLink } from 'lucide-react';

function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts * 1000;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then((data: NewsItem[]) => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="news-card">
      <div className="news-header">
        <div className="news-title-row">
          <Newspaper size={14} className="news-icon" />
          <span className="section-title" style={{ margin: 0 }}>Market News</span>
        </div>
        <span className="news-source-note">via Yahoo Finance</span>
      </div>

      {loading && (
        <div className="news-skeleton">
          {[1,2,3].map(i => <div key={i} className="news-skeleton-item" />)}
        </div>
      )}

      {!loading && news.length === 0 && (
        <p className="news-empty">Could not load news. Check your connection.</p>
      )}

      {!loading && news.length > 0 && (
        <ul className="news-list">
          {news.map((item, i) => (
            <li key={i} className="news-item">
              <span className="news-bullet" />
              <div className="news-content">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-headline"
                >
                  {item.title}
                  <ExternalLink size={11} className="news-ext-icon" />
                </a>
                <span className="news-meta">
                  {item.publisher}
                  {item.providerPublishTime > 0 && (
                    <> · {timeAgo(item.providerPublishTime)}</>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
