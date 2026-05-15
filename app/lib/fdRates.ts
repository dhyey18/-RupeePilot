export interface FDRate {
  bank: string;
  shortName: string;
  color: string;
  tenures: { label: string; general: number; senior: number }[];
  special?: string;
}

export const FD_RATES: FDRate[] = [
  {
    bank: 'State Bank of India',
    shortName: 'SBI',
    color: '#1a56db',
    tenures: [
      { label: '1 Year', general: 6.80, senior: 7.30 },
      { label: '2 Years', general: 7.00, senior: 7.50 },
      { label: '5 Years', general: 6.50, senior: 7.50 },
    ],
  },
  {
    bank: 'HDFC Bank',
    shortName: 'HDFC',
    color: '#0f9d58',
    tenures: [
      { label: '1 Year', general: 6.60, senior: 7.10 },
      { label: '2 Years', general: 7.00, senior: 7.50 },
      { label: '5 Years', general: 7.00, senior: 7.50 },
    ],
    special: 'Senior citizens get 0.50% extra',
  },
  {
    bank: 'ICICI Bank',
    shortName: 'ICICI',
    color: '#f4900c',
    tenures: [
      { label: '1 Year', general: 6.70, senior: 7.20 },
      { label: '2 Years', general: 7.00, senior: 7.50 },
      { label: '5 Years', general: 7.00, senior: 7.50 },
    ],
  },
  {
    bank: 'Axis Bank',
    shortName: 'Axis',
    color: '#8b0000',
    tenures: [
      { label: '1 Year', general: 6.70, senior: 7.20 },
      { label: '2 Years', general: 7.10, senior: 7.60 },
      { label: '5 Years', general: 7.00, senior: 7.75 },
    ],
    special: 'Best 2-year rate',
  },
  {
    bank: 'Bank of Baroda',
    shortName: 'BoB',
    color: '#f97316',
    tenures: [
      { label: '1 Year', general: 6.85, senior: 7.35 },
      { label: '2 Years', general: 7.15, senior: 7.65 },
      { label: '5 Years', general: 6.50, senior: 7.15 },
    ],
    special: 'Good for 1-2 year FDs',
  },
  {
    bank: 'Post Office TD',
    shortName: 'Post Office',
    color: '#6366f1',
    tenures: [
      { label: '1 Year', general: 6.90, senior: 6.90 },
      { label: '2 Years', general: 7.00, senior: 7.00 },
      { label: '5 Years', general: 7.50, senior: 7.50 },
    ],
    special: 'Govt-backed, 5yr = tax saving under 80C',
  },
];

export function getBestFDRate(tenureLabel: string, isSenior: boolean): FDRate & { bestRate: number } {
  let best = FD_RATES[0];
  let bestRate = 0;
  for (const fd of FD_RATES) {
    const t = fd.tenures.find(t => t.label === tenureLabel);
    if (!t) continue;
    const rate = isSenior ? t.senior : t.general;
    if (rate > bestRate) { bestRate = rate; best = fd; }
  }
  return { ...best, bestRate };
}
