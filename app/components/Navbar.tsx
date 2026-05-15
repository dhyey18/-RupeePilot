'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, TrendingUp, Star, MessageCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: TrendingUp },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/chat', label: 'Ask AI', icon: MessageCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <span className="brand-icon">₹</span>
            <span className="brand-name">RupeePilot</span>
          </Link>

          <div className="nav-links">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${pathname === href ? 'nav-link-active' : ''} ${href === '/chat' ? 'nav-link-chat' : ''}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <button onClick={toggle} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`mobile-nav-item ${pathname === href ? 'mobile-nav-active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
        <button onClick={toggle} className="mobile-nav-item mobile-nav-theme" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          <span>Theme</span>
        </button>
      </nav>
    </>
  );
}
