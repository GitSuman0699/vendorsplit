import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST() {
  try {
    const pendingTxs = await prisma.transaction.findMany({
      where: {
        status: { in: ['approved', 'success'] }
      },
      include: { vendor: true }
    });

    if (pendingTxs.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending transactions to settle.' });
    }

    const vendorTotals = new Map<string, {
      vendorName: string;
      eventId: string;
      grossTotal: number;
      commissionTotal: number;
      netTotal: number;
      txCount: number;
    }>();

    for (const tx of pendingTxs) {
      const vendor = tx.vendor;
      if (!vendor) continue;

      if (!vendorTotals.has(tx.vendorId)) {
        vendorTotals.set(tx.vendorId, {
          vendorName: vendor.name,
          eventId: tx.eventId,
          grossTotal: 0,
          commissionTotal: 0,
          netTotal: 0,
          txCount: 0,
        });
      }

      const t = vendorTotals.get(tx.vendorId)!;
      t.grossTotal += tx.amount;
      t.commissionTotal += tx.commission;
      t.netTotal += tx.netAmount;
      t.txCount += 1;
    }

    // Mark as settled in the database using a transaction
    await prisma.transaction.updateMany({
      where: { id: { in: pendingTxs.map(t => t.id) } },
      data: { status: 'settled' }
    });

    // Simulate some network delay for the UI button
    await sleep(1500);

    return NextResponse.json({ 
      success: true, 
      message: `Settled ${pendingTxs.length} transactions across ${vendorTotals.size} vendors.`,
      data: Array.from(vendorTotals.values())
    });

  } catch (error) {
    console.error('Failed to run settlement simulation:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
