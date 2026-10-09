import { CurrencyOption, WatermarkSettings, QuoteCustomerInfo, PlanColumn, AddonItem, CustomServiceItem, DiscountSettings, CreatorContactInfo, QuoteData } from '../types';

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateVsUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateVsUSD: 1.0 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateVsUSD: 1.0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateVsUSD: 1.0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateVsUSD: 1.0 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateVsUSD: 1.0 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateVsUSD: 1.0 },
];

export const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: true,
  text: 'TESTGRID',
  subtext: 'Confidential',
  opacity: 0.08,
  fontSize: 10, // rem for CSS, pt for PDF
  color: '#2c3260',
  angle: 20,
  repeat: true,
};

export const DEFAULT_CUSTOMER: QuoteCustomerInfo = {
  quoteNumber: 'TG-2026-8041',
  customerName: 'Acme Enterprises Inc.',
  customerEmail: 'procurement@acme.com',
  companyName: 'TestGrid Labs Inc.',
  preparedBy: 'Your name',
  preparedByTitle: 'Your Title',
  preparedByEmail: 'jeff.fleishman@testgrid.ai',
  date: new Date().toISOString().split('T')[0],
  validityDays: '30 days',
  paymentTerms: 'Net 30 Days',
  currency: 'USD',
};

export const DEFAULT_CREATOR_INFO: CreatorContactInfo = {
  authorName: 'Author Name',
  authorRole: 'Author Role / Title',
  authorEmail: 'jeff.fleishman@testgrid.ai',
  authorPhone: '+1 (800) 555-8378',
  companyWebsite: 'https://testgrid.io',
  supportEmail: 'support@testgrid.io',
};

export const DEFAULT_PLANS: PlanColumn[] = [
  {
    id: 'hostedPlanBox',
    title: 'Hosted Private Cloud',
    badge: 'Private cloud',
    iconName: 'Cloud',
    tiers: [
      {
        id: 'tier-hosted-1',
        prefix: 'Hosted',
        label: 'Tier 1 (Standard)',
        deviceCost: 3000,
        deviceQty: 0,
        deviceDiscountable: true,
        browserCost: 1500,
        browserQty: 0,
        browserDiscountable: true,
        note: 'Dedicated cloud node with 99.9% uptime SLA & SOC2 Type II compliance',
      },
    ],
  },
  {
    id: 'onPremPlanBox',
    title: 'On-Premise',
    badge: 'Self-hosted',
    iconName: 'Server',
    tiers: [
      {
        id: 'tier-onprem-1',
        prefix: 'OnPrem',
        label: 'Tier 1 (Enterprise)',
        deviceCost: 2750,
        deviceQty: 0,
        deviceDiscountable: true,
        browserCost: 1250,
        browserQty: 0,
        browserDiscountable: true,
        note: 'Air-gapped deployment with customer-managed encryption keys',
      },
    ],
  },
];

export const DEFAULT_ADDONS: AddonItem[] = [
  {
    id: 'addon-cotester',
    label: 'CoTester + AI Agent Studio',
    iconName: 'Bot',
    cost: 5000,
    selected: false,
    category: 'AI Automation',
    qty: 1,
    discountable: true,
  },
  {
    id: 'addon-scriptless',
    label: 'Scriptless Record & Playback',
    iconName: 'PlayCircle',
    cost: 3500,
    selected: false,
    category: 'Test Execution',
    qty: 1,
    discountable: true,
  },
  {
    id: 'addon-visual-api',
    label: 'Visual Testing + API Automation',
    iconName: 'Eye',
    cost: 2500,
    selected: false,
    category: 'Quality Suite',
    qty: 1,
    discountable: true,
  },
  {
    id: 'addon-load',
    label: 'Load & Performance Testing',
    iconName: 'TrendingUp',
    cost: 4000,
    selected: false,
    category: 'Performance',
    qty: 1,
    discountable: true,
  },
  {
    id: 'addon-accessibility',
    label: 'WCAG 2.1 Accessibility Suite',
    iconName: 'Accessibility',
    cost: 2000,
    selected: false,
    category: 'Compliance',
    qty: 1,
    discountable: true,
  },
  {
    id: 'addon-security',
    label: 'DAST & Security Scanner',
    iconName: 'ShieldCheck',
    cost: 4500,
    selected: false,
    category: 'Security',
    qty: 1,
    discountable: true,
  },
];

export const DEFAULT_SERVICES: CustomServiceItem[] = [
  {
    id: 'service-implementation',
    description: 'Enterprise Onboarding & CI/CD Pipeline Integration',
    cost: 2500,
    qty: 1,
    billingType: 'one-time',
    discountable: true,
  },
];

export const DEFAULT_DISCOUNT: DiscountSettings = {
  rate: 10,
  type: 'percentage',
  flatAmount: 0,
  billingCycle: 'annual',
  commitmentYears: 1,
  paymentSchedule: 'Annually',
};

export const DEFAULT_DISCLAIMER = `+ Premium 24/7 dedicated support and an assigned Solutions Engineer are included with annual subscription packages.
+ License counts are scalable mid-term with pro-rated billing.
+ Security & Infrastructure: 99.9% SLA Guarantee, SOC2 Type II Certified, ISO 27001, Single Sign-On (SAML/Okta).
Prices listed are net values in the chosen currency and valid for 30 days from issue date.`;

export const PRIVACY_CONFIDENTIALITY_NOTICE = 'PRIVATE & CONFIDENTIAL — Contains proprietary TestGrid information. Intended solely for the named recipient; unauthorized use, disclosure, or distribution is prohibited.';

export function buildDefaultOrderInstructions(commercialTerms: string): string {
  return [commercialTerms.trim(), PRIVACY_CONFIDENTIALITY_NOTICE].filter(Boolean).join('\n\n');
}

export const INITIAL_QUOTE_STATE: QuoteData = {
  id: 'quote-default-1',
  title: 'Standard TestGrid Enterprise Quote',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  customerInfo: DEFAULT_CUSTOMER,
  plans: DEFAULT_PLANS,
  addons: DEFAULT_ADDONS,
  customServices: DEFAULT_SERVICES,
  discountSettings: DEFAULT_DISCOUNT,
  watermarkSettings: DEFAULT_WATERMARK,
  disclaimerNotice: DEFAULT_DISCLAIMER,
  notes: 'Customer requested 5 dedicated mobile devices + 10 browser execution channels for iOS/Android regression suite.',
  salesOrder: {
    id: 'order-default-1',
    sourceQuoteId: 'quote-default-1',
    invoiceNumber: 'TG-INV-2026-8041',
    orderDate: new Date().toISOString().split('T')[0],
    purchaseOrderNumber: '',
    paymentTerms: DEFAULT_CUSTOMER.paymentTerms,
    billingAddress: '',
    serviceAddress: '',
    instructions: buildDefaultOrderInstructions(DEFAULT_DISCLAIMER),
  },
  showAddonsSection: true,
  showServicesSection: true,
  creatorContactInfo: DEFAULT_CREATOR_INFO,
  excludedLineItemIds: [],
};

export const SAMPLE_TEMPLATES: { name: string; description: string; data: Partial<QuoteData> }[] = [
  {
    name: 'Enterprise Cloud Package',
    description: '10 Device licenses + 20 Browser licenses + AI CoTester & Performance Add-ons',
    data: {
      customerInfo: {
        ...DEFAULT_CUSTOMER,
        companyName: 'TestGrid Labs Inc.',
        customerName: 'Global Fintech Corp',
      },
      plans: [
        {
          id: 'hostedPlanBox',
          title: 'Hosted Private Cloud',
          badge: 'Private Cloud',
          iconName: 'Cloud',
          tiers: [
            {
              id: 'tier-cloud-ent',
              prefix: 'Hosted',
              label: 'Enterprise Tier',
              deviceCost: 3000,
              deviceQty: 5,
              browserCost: 1500,
              browserQty: 10,
              note: 'High-availability dedicated device rack',
            },
          ],
        },
      ],
      addons: DEFAULT_ADDONS.map((a) =>
        a.id === 'addon-cotester' || a.id === 'addon-load' ? { ...a, selected: true } : a
      ),
      discountSettings: {
        rate: 15,
        type: 'percentage',
        flatAmount: 0,
        billingCycle: 'annual',
      },
    },
  },
  {
    name: 'On-Premise Banking Starter',
    description: 'Self-hosted air-gapped setup with Security & Accessibility suites',
    data: {
      customerInfo: {
        ...DEFAULT_CUSTOMER,
        companyName: 'TestGrid Labs Inc.',
        customerName: 'First National Bank',
      },
      plans: [
        {
          id: 'onPremPlanBox',
          title: 'On-Premise',
          badge: 'Self-hosted',
          iconName: 'Server',
          tiers: [
            {
              id: 'tier-onprem-bank',
              prefix: 'OnPrem',
              label: 'Secure Vault Tier',
              deviceCost: 2750,
              deviceQty: 4,
              browserCost: 1250,
              browserQty: 8,
              note: 'Deployed on-prem behind bank firewall',
            },
          ],
        },
      ],
      addons: DEFAULT_ADDONS.map((a) =>
        a.id === 'addon-security' || a.id === 'addon-accessibility' ? { ...a, selected: true } : a
      ),
      discountSettings: {
        rate: 10,
        type: 'percentage',
        flatAmount: 0,
        billingCycle: 'annual',
      },
    },
  },
  {
    name: 'Hybrid AI Test Automation',
    description: 'Hosted + On-Premise hybrid setup with full AI suite',
    data: {
      customerInfo: {
        ...DEFAULT_CUSTOMER,
        companyName: 'TestGrid Labs Inc.',
        customerName: 'OmniHealth Technologies',
      },
      plans: DEFAULT_PLANS.map((plan, idx) => ({
        ...plan,
        tiers: plan.tiers.map((tier) => ({
          ...tier,
          deviceQty: idx === 0 ? 3 : 2,
          browserQty: idx === 0 ? 6 : 4,
        })),
      })),
      addons: DEFAULT_ADDONS.map((a) =>
        a.id === 'addon-cotester' || a.id === 'addon-scriptless' || a.id === 'addon-visual-api'
          ? { ...a, selected: true }
          : a
      ),
      discountSettings: {
        rate: 20,
        type: 'percentage',
        flatAmount: 0,
        billingCycle: 'annual',
      },
    },
  },
];
