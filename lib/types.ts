// ============================================================
// VendorSplit Domain Types
// ============================================================

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // ISO date
  location: string;
  commissionRate: number; // 0.0 - 1.0 (e.g., 0.10 = 10%)
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  pinchMerchantId: string; // mch_test_XXXXX from Pinch
  paymentLinkUrl?: string; // Pinch-hosted payment page URL
  paymentLinkId?: string; // Pinch payment link ID
  qrCodeData?: string; // Encoded QR data URL
  status: 'pending' | 'active' | 'inactive';
  totalSales: number; // cents
  totalCommission: number; // cents
  totalNet: number; // cents
  transactionCount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  vendorId: string;
  eventId: string;
  pinchPaymentId: string; // pmt_XXXXX from Pinch
  amount: number; // cents
  commission: number; // cents (applicationFee)
  netAmount: number; // cents (amount - commission - fees)
  currency: string;
  status: 'pending' | 'processing' | 'approved' | 'success' | 'dishonoured' | 'settled' | 'cancelled';
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: 'credit-card' | 'bank-account';
  createdAt: string;
  settledAt?: string;
}

export interface DashboardStats {
  eventId: string;
  totalRevenue: number; // cents — total across all vendors
  totalCommission: number; // cents — organizer's take
  transactionCount: number;
  activeVendors: number;
  recentTransactions: Transaction[];
  vendorBreakdown: VendorStats[];
}

export interface VendorStats {
  vendorId: string;
  vendorName: string;
  totalSales: number;
  totalCommission: number;
  totalNet: number;
  transactionCount: number;
}

// ============================================================
// Pinch API Types (subset we use)
// ============================================================

export interface PinchAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PinchManagedMerchant {
  id: string;
  testMerchantId: string;
  testOnlyMerchant: boolean;
  companyName: string;
  companyEmail: string;
  bankAccountRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountName: string;
  country: string;
  compliance: {
    status: string;
    liveEnabled: boolean;
    transactionsEnabled: boolean;
    settlementsEnabled: boolean;
  };
  contacts: PinchContact[];
}

export interface PinchContact {
  id?: string;
  isPrimaryContact: boolean;
  firstName: string;
  lastName: string;
  email: string;
  contactType: 'owner' | 'director' | 'shareholder' | 'executive';
  phone?: string;
}

export interface PinchPayer {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobileNumber?: string;
  sources?: PinchSource[];
}

export interface PinchSource {
  id: string;
  sourceType: 'bank-account' | 'credit-card';
  displayCardNumber?: string;
  cardScheme?: string;
  bankAccountBsb?: string;
  bankAccountNumber?: string;
}

export interface PinchPaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  payerId?: string;
  paymentId?: string;
}

export interface PinchPayment {
  id: string;
  payerId: string;
  amount: number;
  currency: string;
  status: 'scheduled' | 'processing' | 'approved' | 'success' | 'dishonoured' | 'settled' | 'cancelled';
  transactionDate: string;
  applicationFee?: number;
  attempts?: PinchAttempt[];
}

export interface PinchAttempt {
  id: string;
  amount: number;
  status: string;
  transactionDate: string;
  source?: PinchSource;
  fees?: {
    transactionFee: number;
    applicationFee: number;
    totalFee: number;
  };
}

export interface PinchTransfer {
  id: string;
  transferDate: string;
  amount: number;
  currency: string;
  status: string;
  accountName: string;
  accountNumber: string;
  bsb: string;
  totalFees: number;
  summary: {
    settlements: number;
    dishonours: number;
    refunds: number;
    applicationFees: number;
    processingFees: number;
  };
}

export interface PinchEvent {
  id: string;
  type: string;
  eventDate: string;
  data: Record<string, unknown>;
}

export interface PinchWebhook {
  id: string;
  uri: string;
  eventTypes: string[];
  secret: string;
}

export interface PinchFeeCalculation {
  amount: number;
  currency: string;
  netAmount: number;
  isSurcharged: boolean;
  fees: {
    transactionFee: number;
    applicationFee: number;
    totalFee: number;
    taxRate: number;
  };
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface CreateEventRequest {
  name: string;
  description: string;
  date: string;
  location: string;
  commissionRate: number;
}

export interface CreateVendorRequest {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  bankBsb: string;
  bankAccountNumber: string;
  bankAccountName: string;
  contactFirstName: string;
  contactLastName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
