// ============================================================
// VendorSplit Data Layer (Postgres + Prisma)
// ============================================================

import { PrismaClient } from '@prisma/client';
import type { Event, Vendor, Transaction, DashboardStats, VendorStats } from './types';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function generateId(): string {
  return `vs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================================
// EVENTS
// ============================================================

export async function createEvent(data: Omit<Event, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Event> {
  const event = await prisma.event.create({
    data: {
      id: generateId(),
      name: data.name,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      location: data.location,
      commissionRate: data.commissionRate,
      status: 'active',
    },
  });
  return event as unknown as Event;
}

export async function getEvent(id: string): Promise<Event | undefined> {
  const event = await prisma.event.findUnique({ where: { id } });
  return (event as unknown as Event) || undefined;
}

export async function listEvents(): Promise<Event[]> {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return events as unknown as Event[];
}

export async function seedDemoData(): Promise<void> {
  const existing = await prisma.event.count();
  if (existing > 0) return;

  const eventId = generateId();
  await prisma.event.create({
    data: {
      id: eventId,
      name: 'Sydney Street Eats Festival',
      description: 'A vibrant street food festival showcasing the best vendors in Sydney.',
      date: new Date('2026-08-15T10:00:00+10:00'),
      location: 'Darling Harbour, Sydney',
      commissionRate: 0.10,
      status: 'active',
    }
  });
}

// ============================================================
// VENDORS
// ============================================================

export async function createVendor(data: Omit<Vendor, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
  const vendor = await prisma.vendor.create({
    data: {
      id: generateId(),
      eventId: data.eventId,
      name: data.name,
      contactEmail: data.email,
      pinchMerchantId: data.pinchMerchantId,
      status: 'active',
    }
  });
  return vendor as unknown as Vendor;
}

export async function getVendor(id: string): Promise<Vendor | undefined> {
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  return (vendor as unknown as Vendor) || undefined;
}

export async function getVendorByPinchMerchantId(pinchMerchantId: string): Promise<Vendor | undefined> {
  const vendor = await prisma.vendor.findFirst({ where: { pinchMerchantId } });
  return (vendor as unknown as Vendor) || undefined;
}

export async function listVendorsForEvent(eventId: string): Promise<Vendor[]> {
  const vendors = await prisma.vendor.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });
  return vendors as unknown as Vendor[];
}

// ============================================================
// TRANSACTIONS
// ============================================================

export async function createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
  const tx = await prisma.transaction.create({
    data: {
      id: generateId(),
      eventId: data.eventId,
      vendorId: data.vendorId,
      pinchPaymentId: data.pinchPaymentId,
      amount: data.amount,
      commission: data.commission,
      netAmount: data.netAmount,
      status: data.status,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      paymentMethod: data.paymentMethod,
    }
  });
  return tx as unknown as Transaction;
}

export async function getTransactionByPinchPaymentId(pinchId: string): Promise<Transaction | undefined> {
  const tx = await prisma.transaction.findUnique({ where: { pinchPaymentId: pinchId } });
  return (tx as unknown as Transaction) || undefined;
}

export async function listTransactionsForVendor(vendorId: string): Promise<Transaction[]> {
  const txs = await prisma.transaction.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
  });
  return txs as unknown as Transaction[];
}

// ============================================================
// ANALYTICS / DASHBOARD
// ============================================================

export async function getDashboardStats(eventId: string): Promise<DashboardStats> {
  const vendors = await prisma.vendor.findMany({ where: { eventId } });
  const txs = await prisma.transaction.findMany({
    where: { 
      eventId,
      status: { in: ['approved', 'success', 'settled'] }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalRevenue = txs.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = txs.reduce((sum, t) => sum + t.commission, 0);
  const transactionCount = txs.length;

  const vendorBreakdownMap = new Map<string, VendorStats>();

  for (const v of vendors) {
    vendorBreakdownMap.set(v.id, {
      vendorId: v.id,
      vendorName: v.name,
      totalSales: 0,
      totalCommission: 0,
      totalNet: 0,
      transactionCount: 0,
    });
  }

  for (const t of txs) {
    if (vendorBreakdownMap.has(t.vendorId)) {
      const stats = vendorBreakdownMap.get(t.vendorId)!;
      stats.totalSales += t.amount;
      stats.totalCommission += t.commission;
      stats.totalNet += t.netAmount;
      stats.transactionCount += 1;
    }
  }

  const vendorBreakdown = Array.from(vendorBreakdownMap.values())
    .sort((a, b) => b.totalSales - a.totalSales);

  return {
    eventId,
    totalRevenue,
    totalCommission,
    transactionCount,
    activeVendors: vendors.length,
    recentTransactions: txs.slice(0, 10) as unknown as Transaction[],
    vendorBreakdown,
  };
}

// ============================================================
// SETTLEMENT
// ============================================================

export async function getPendingSettlementCount(): Promise<number> {
  return prisma.transaction.count({
    where: {
      status: { in: ['approved', 'success'] },
    },
  });
}

