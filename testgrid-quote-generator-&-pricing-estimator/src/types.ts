import { ProposalThemeKey } from './data/themes';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  rateVsUSD: number; // For reference
}

export interface WatermarkSettings {
  enabled: boolean;
  mode?: 'text' | 'image';
  text: string;
  subtext: string;
  imageUrl?: string;
  imageWidth?: number; // e.g. 100
  opacity: number; // e.g. 0.05 (5%)
  fontSize: number; // e.g. 10 (rem) or pt
  color: string; // e.g. '#2c3260'
  angle: number; // e.g. -20 degrees
  repeat: boolean;
}

export interface QuoteCustomerInfo {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  logoUrl?: string; // Custom company logo DataURL or URL
  preparedBy: string;
  preparedByTitle: string;
  preparedByEmail: string;
  date: string; // YYYY-MM-DD
  validityDays: string; // e.g., '30 days' or '2026-08-31'
  paymentTerms: string; // e.g., 'Net 30', '100% Upfront', '50/50'
  currency: string; // 'USD', 'EUR', 'GBP', 'INR', etc.
}

export interface CreatorContactInfo {
  authorName: string;
  authorRole: string;
  department?: string; // e.g., Solutions Engineering & Advisory
  authorEmail: string;
  authorPhone: string;
  companyWebsite: string;
  supportEmail: string;
}

export interface TierRowData {
  id: string;
  prefix: string; // e.g. 'Hosted', 'OnPrem', 'SaaS'
  label: string; // e.g. 'Tier 1', 'Starter', 'Enterprise'
  deviceCost: number;
  deviceQty: number;
  deviceDiscountable?: boolean;
  browserCost: number;
  browserQty: number;
  browserDiscountable?: boolean;
  concurrentCost?: number;
  concurrentQty?: number;
  concurrentDiscountable?: boolean;
  note: string;
}

export interface PlanColumn {
  id: string;
  title: string;
  badge: string;
  iconName: string; // Lucide icon identifier
  tiers: TierRowData[];
  hidden?: boolean;
}

export interface AddonItem {
  id: string;
  label: string;
  iconName: string;
  cost: number;
  selected: boolean;
  category?: string;
  qty: number;
  discountable?: boolean;
}

export interface CustomServiceItem {
  id: string;
  description: string;
  cost: number;
  qty: number;
  billingType: 'one-time' | 'recurring';
  discountable?: boolean;
}

export interface DiscountSettings {
  rate: number; // Percentage, e.g. 10 for 10%
  type: 'percentage' | 'flat';
  flatAmount: number;
  billingCycle: 'annual' | 'monthly'; // Annual gets discount rate apply, Monthly strictly gets 0 discount
  commitmentYears?: number; // 1, 2, 3, 5 years
  paymentSchedule?: 'Upfront' | 'Annually' | 'Bi-annually' | 'Quarterly' | 'Monthly';
}

export interface QuoteCalculatedLineItem {
  id: string;
  type: 'tier-device' | 'tier-browser' | 'tier-concurrent' | 'addon' | 'custom-service';
  label: string;
  note?: string;
  qty: number;
  unitCostOriginal: number;
  unitCostDiscounted: number;
  totalOriginal: number;
  totalDiscounted: number;
  isDiscountable: boolean;
  sourceRef?: string;
}

export interface QuoteData {
  id: string;
  title: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  customerInfo: QuoteCustomerInfo;
  plans: PlanColumn[];
  addons: AddonItem[];
  customServices: CustomServiceItem[];
  discountSettings: DiscountSettings;
  watermarkSettings: WatermarkSettings;
  disclaimerNotice: string;
  notes: string;
  showAddonsSection?: boolean;
  showServicesSection?: boolean;
  creatorContactInfo?: CreatorContactInfo;
  excludedLineItemIds?: string[];
  themePreset?: ProposalThemeKey;
}

