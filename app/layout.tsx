import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import Navbar from './components/Navbar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'RupeePilot — Your Personal Investment Dashboard',
  description: 'Daily market insights and investment recommendations for Indian investors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="page-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
