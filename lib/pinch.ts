// ============================================================
// Pinch Payments API Client
// ============================================================
// Wraps all Pinch API calls used by VendorSplit.
// When PINCH_SECRET_KEY is not configured, falls back to mock
// responses so the UI can be developed without live credentials.
// ============================================================

import type {
  PinchAuthResponse,
  PinchManagedMerchant,
  PinchPayer,
  PinchPaymentLink,
  PinchPayment,
  PinchTransfer,
  PinchEvent,
  PinchWebhook,
  PinchFeeCalculation,
} from './types';

const API_BASE = process.env.PINCH_API_BASE || 'https://api.getpinch.com.au/test';
const API_VERSION = process.env.PINCH_API_VERSION || '2020.1';
const MERCHANT_ID = process.env.PINCH_MERCHANT_ID || '';
const SECRET_KEY = process.env.PINCH_SECRET_KEY || '';

const IS_MOCK = !SECRET_KEY || SECRET_KEY === 'sk_test_REPLACE_ME';

// ---- Token cache ----
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Get an OAuth access token from Pinch.
 * Caches the token until it expires.
 */
async function getAccessToken(): Promise<string> {
  if (IS_MOCK) return 'mock_access_token';

  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await fetch('https://auth.getpinch.com.au/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.PINCH_APPLICATION_ID || MERCHANT_ID,
      client_secret: SECRET_KEY,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinch auth failed (${res.status}): ${text}`);
  }

  const data: PinchAuthResponse = await res.json();
  cachedToken = data.access_token;
  // Expire 60 seconds early to be safe
  tokenExpiresAt = now + (data.expires_in - 60) * 1000;
  return cachedToken;
}

/**
 * Make an authenticated request to the Pinch API.
 */
async function pinchFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    merchantId?: string; // For Current-Merchant header (managed merchants)
  } = {}
): Promise<T> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'pinch-version': API_VERSION,
  };

  // Act on behalf of a managed merchant
  if (options.merchantId) {
    headers['Current-Merchant'] = options.merchantId;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinch API error (${res.status} ${path}): ${text}`);
  }

  return res.json();
}

// ============================================================
// MANAGED MERCHANTS
// ============================================================

export async function createManagedMerchant(params: {
  companyName: string;
  companyEmail: string;
  bankBsb: string;
  bankAccountNumber: string;
  bankAccountName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
}): Promise<PinchManagedMerchant> {
  if (IS_MOCK) {
    return mockManagedMerchant(params.companyName, params.companyEmail);
  }

  return pinchFetch<PinchManagedMerchant>('/merchants/managed', {
    method: 'POST',
    body: {
      companyName: params.companyName,
      companyEmail: params.companyEmail,
      bankAccountRoutingNumber: params.bankBsb.replace(/[-\s]/g, ''),
      bankAccountNumber: params.bankAccountNumber.replace(/[-\s]/g, ''),
      bankAccountName: params.bankAccountName,
      country: 'AU',
      contacts: [
        {
          isPrimaryContact: true,
          firstName: params.contactFirstName,
          lastName: params.contactLastName,
          email: params.contactEmail,
          contactType: 'owner',
        },
      ],
      ipAddress: '127.0.0.1',
      userAgent: 'VendorSplit/1.0',
    },
  });
}

export async function listManagedMerchants(): Promise<PinchManagedMerchant[]> {
  if (IS_MOCK) return [mockManagedMerchant('Mock Vendor', 'mock@vendor.com')];
  const data = await pinchFetch<{ data: PinchManagedMerchant[] }>('/merchants/managed');
  return data.data || [];
}

// ============================================================
// PAYERS
// ============================================================

export async function createOrUpdatePayer(
  params: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    mobileNumber?: string;
  },
  merchantId?: string
): Promise<PinchPayer> {
  if (IS_MOCK) return mockPayer(params.firstName, params.lastName, params.emailAddress);

  return pinchFetch<PinchPayer>('/payers', {
    method: 'POST',
    body: params,
    merchantId,
  });
}

// ============================================================
// PAYMENT LINKS
// ============================================================

export async function createPaymentLink(
  params: {
    amount: number; // cents
    description: string;
    payerFirstName?: string;
    payerLastName?: string;
    payerEmail?: string;
    payerId?: string;
    returnUrl?: string;
    applicationFee?: number; // cents — organizer's commission
  },
  merchantId?: string
): Promise<PinchPaymentLink> {
  if (IS_MOCK) return mockPaymentLink(params.amount, params.description);

  return pinchFetch<PinchPaymentLink>('/payment-links', {
    method: 'POST',
    body: {
      amount: params.amount,
      currency: 'AUD',
      description: params.description,
      payerId: params.payerId,
      payerFirstName: params.payerFirstName,
      payerLastName: params.payerLastName,
      payerEmail: params.payerEmail,
      returnUrl: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment-complete`,
      allowedPaymentMethods: ['credit-card'],
      applicationFee: params.applicationFee,
    },
    merchantId,
  });
}

export async function getPaymentLink(
  paymentLinkId: string,
  merchantId?: string
): Promise<PinchPaymentLink> {
  if (IS_MOCK) return mockPaymentLink(1500, 'Mock payment');

  return pinchFetch<PinchPaymentLink>(`/payment-links/${paymentLinkId}`, {
    merchantId,
  });
}

// ============================================================
// PAYMENTS
// ============================================================

export async function getPayment(
  paymentId: string,
  merchantId?: string
): Promise<PinchPayment> {
  if (IS_MOCK) return mockPayment(paymentId, 1500);

  return pinchFetch<PinchPayment>(`/payments/${paymentId}`, {
    merchantId,
  });
}

export async function listProcessedPayments(
  merchantId?: string,
  page = 1,
  pageSize = 50
): Promise<{ data: PinchPayment[]; totalPages: number }> {
  if (IS_MOCK) return { data: [mockPayment('pmt_mock1', 1500)], totalPages: 1 };

  return pinchFetch(`/payments/processed?page=${page}&pageSize=${pageSize}`, {
    merchantId,
  });
}

// ============================================================
// TRANSFERS
// ============================================================

export async function listTransfers(
  merchantId?: string,
  page = 1,
  pageSize = 50
): Promise<{ data: PinchTransfer[]; totalPages: number }> {
  if (IS_MOCK) return { data: [mockTransfer()], totalPages: 1 };

  return pinchFetch(`/transfers?page=${page}&pageSize=${pageSize}`, {
    merchantId,
  });
}

export async function getTransfer(
  transferId: string,
  merchantId?: string
): Promise<PinchTransfer> {
  if (IS_MOCK) return mockTransfer();

  return pinchFetch<PinchTransfer>(`/transfers/${transferId}`, {
    merchantId,
  });
}

// ============================================================
// EVENTS
// ============================================================

export async function listEvents(
  params?: { type?: string; startDate?: string; endDate?: string },
  merchantId?: string
): Promise<{ data: PinchEvent[] }> {
  if (IS_MOCK) return { data: [] };

  const queryParts: string[] = [];
  if (params?.type) queryParts.push(`type=${params.type}`);
  if (params?.startDate) queryParts.push(`startDate=${params.startDate}`);
  if (params?.endDate) queryParts.push(`endDate=${params.endDate}`);
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';

  return pinchFetch(`/events${query}`, { merchantId });
}

// ============================================================
// WEBHOOKS
// ============================================================

export async function createWebhook(
  params: {
    uri: string;
    eventTypes: string[];
  },
  merchantId?: string
): Promise<PinchWebhook> {
  if (IS_MOCK) return mockWebhook(params.uri);

  return pinchFetch<PinchWebhook>('/webhooks', {
    method: 'POST',
    body: params,
    merchantId,
  });
}

// ============================================================
// FEES
// ============================================================

export async function calculateFees(
  params: {
    amount: number; // cents
    sourceType?: string;
    applicationFee?: number; // cents
  },
  merchantId?: string
): Promise<PinchFeeCalculation> {
  if (IS_MOCK) return mockFeeCalc(params.amount, params.applicationFee);

  return pinchFetch<PinchFeeCalculation>('/fees/calculate', {
    method: 'POST',
    body: {
      amount: params.amount,
      sourceType: params.sourceType || 'credit-card',
      applicationFee: params.applicationFee || 0,
      currency: 'AUD',
    },
    merchantId,
  });
}

// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkHealth(): Promise<{ isConnected: boolean; mode: string }> {
  if (IS_MOCK) {
    return { isConnected: false, mode: 'mock' };
  }

  try {
    await pinchFetch('/health');
    return { isConnected: true, mode: 'sandbox' };
  } catch {
    return { isConnected: false, mode: 'error' };
  }
}

// ============================================================
// Utility
// ============================================================

export function isMockMode(): boolean {
  return IS_MOCK;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ============================================================
// MOCK DATA GENERATORS
// ============================================================

let mockIdCounter = 1;

function mockId(prefix: string): string {
  return `${prefix}_mock_${Date.now()}_${mockIdCounter++}`;
}

function mockManagedMerchant(name: string, email: string): PinchManagedMerchant {
  return {
    id: mockId('mch'),
    testMerchantId: mockId('mch_test'),
    testOnlyMerchant: true,
    companyName: name,
    companyEmail: email,
    bankAccountRoutingNumber: '000000',
    bankAccountNumber: '000000000',
    bankAccountName: name,
    country: 'AU',
    compliance: {
      status: 'new',
      liveEnabled: false,
      transactionsEnabled: false,
      settlementsEnabled: false,
    },
    contacts: [
      {
        id: mockId('con'),
        isPrimaryContact: true,
        firstName: name.split(' ')[0] || 'Test',
        lastName: name.split(' ')[1] || 'Vendor',
        email,
        contactType: 'owner',
      },
    ],
  };
}

function mockPayer(first: string, last: string, email: string): PinchPayer {
  return {
    id: mockId('pyr'),
    firstName: first,
    lastName: last,
    emailAddress: email,
    sources: [],
  };
}

function mockPaymentLink(amount: number, description: string): PinchPaymentLink {
  return {
    id: mockId('pl'),
    url: `https://pay.getpinch.com.au/test/${mockId('link')}`,
    amount,
    currency: 'AUD',
    description,
    status: 'active',
  };
}

function mockPayment(id: string, amount: number): PinchPayment {
  return {
    id: id || mockId('pmt'),
    payerId: mockId('pyr'),
    amount,
    currency: 'AUD',
    status: 'success',
    transactionDate: new Date().toISOString(),
    applicationFee: Math.round(amount * 0.1),
  };
}

function mockTransfer(): PinchTransfer {
  return {
    id: mockId('tfr'),
    transferDate: new Date().toISOString(),
    amount: 13500,
    currency: 'AUD',
    status: 'completed',
    accountName: 'Mock Vendor',
    accountNumber: '000000000',
    bsb: '000000',
    totalFees: 50,
    summary: {
      settlements: 15000,
      dishonours: 0,
      refunds: 0,
      applicationFees: 1500,
      processingFees: 50,
    },
  };
}

function mockWebhook(uri: string): PinchWebhook {
  return {
    id: mockId('wh'),
    uri,
    eventTypes: ['realtime-payment', 'transfer', 'bank-results'],
    secret: 'whsec_mock_secret_key',
  };
}

function mockFeeCalc(amount: number, applicationFee?: number): PinchFeeCalculation {
  const txFee = Math.round(amount * 0.0195) + 30; // ~1.95% + 30c
  const appFee = applicationFee || 0;
  return {
    amount,
    currency: 'AUD',
    netAmount: amount - txFee - appFee,
    isSurcharged: false,
    fees: {
      transactionFee: txFee,
      applicationFee: appFee,
      totalFee: txFee + appFee,
      taxRate: 0.1,
    },
  };
}
