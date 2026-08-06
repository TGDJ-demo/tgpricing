export type ProposalThemeKey = 'slate-teal' | 'indigo-coral' | 'midnight-executive' | 'emerald-enterprise' | 'minimal-mono';

export interface ProposalTheme {
  key: ProposalThemeKey;
  name: string;
  description: string;
  primaryColor: string; // Hex e.g. '#2c3260'
  accentColor: string; // Hex e.g. '#52bfa3'
  bgGradient: string; // Tailwind class
  badgeBg: string;
  badgeText: string;
  headerBg: string; // Hex for PDF
  headerText: string; // Hex for PDF
}

export const PROPOSAL_THEMES: Record<ProposalThemeKey, ProposalTheme> = {
  'slate-teal': {
    key: 'slate-teal',
    name: 'TestGrid Slate & Teal',
    description: 'Corporate SaaS & Cloud Testing (Navy & Emerald)',
    primaryColor: '#2c3260',
    accentColor: '#52bfa3',
    bgGradient: 'from-slate-900 to-[#2c3260]',
    badgeBg: 'bg-[#52bfa3]/10',
    badgeText: 'text-[#52bfa3]',
    headerBg: '#2c3260',
    headerText: '#ffffff',
  },
  'indigo-coral': {
    key: 'indigo-coral',
    name: 'Modern Indigo & Coral',
    description: 'High-Growth Tech & Digital Products (Indigo & Coral)',
    primaryColor: '#4f46e5',
    accentColor: '#f43f5e',
    bgGradient: 'from-[#1e1b4b] to-[#4f46e5]',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    headerBg: '#4f46e5',
    headerText: '#ffffff',
  },
  'midnight-executive': {
    key: 'midnight-executive',
    name: 'Midnight Executive',
    description: 'Enterprise Luxury & Advisory (Slate & Warm Gold)',
    primaryColor: '#0f172a',
    accentColor: '#d97706',
    bgGradient: 'from-slate-950 to-slate-900',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
    headerBg: '#0f172a',
    headerText: '#ffffff',
  },
  'emerald-enterprise': {
    key: 'emerald-enterprise',
    name: 'Emerald Enterprise',
    description: 'Finance, Banking & Compliance (Forest Green & Mint)',
    primaryColor: '#065f46',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-950 to-[#065f46]',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    headerBg: '#065f46',
    headerText: '#ffffff',
  },
  'minimal-mono': {
    key: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Sleek Monochrome & Architectural (Onyx & Cool Slate)',
    primaryColor: '#18181b',
    accentColor: '#64748b',
    bgGradient: 'from-zinc-950 to-zinc-900',
    badgeBg: 'bg-zinc-100 border-zinc-300',
    badgeText: 'text-zinc-900',
    headerBg: '#18181b',
    headerText: '#ffffff',
  },
};
