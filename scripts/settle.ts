import { prisma } from '../lib/db';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSettlement() {
  console.log('\n======================================================');
  console.log('⏳ INITIATING VENDORSPLIT OVERNIGHT SETTLEMENT SIMULATION');
  console.log('======================================================\n');
  
  await sleep(1500);

  const pendingTxs = await prisma.transaction.findMany({
    where: {
      status: { in: ['approved', 'success'] }
    },
    include: { vendor: { include: { event: true } } }
  });

  if (pendingTxs.length === 0) {
    console.log('✅ No pending transactions to settle. All caught up!');
    console.log('\n======================================================\n');
    return;
  }

  console.log(`🔍 Found ${pendingTxs.length} pending transactions ready for settlement...\n`);
  await sleep(1000);

  // Group by vendor
  const vendorTotals = new Map<string, {
    vendorName: string;
    eventId: string;
    grossTotal: number;
    commissionTotal: number;
    netTotal: number;
    txCount: number;
    eventCommissionRate: number;
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
        eventCommissionRate: vendor.event.commissionRate,
      });
    }

    const t = vendorTotals.get(tx.vendorId)!;
    t.grossTotal += tx.amount;
    t.commissionTotal += tx.commission;
    t.netTotal += tx.netAmount;
    t.txCount += 1;
  }

  console.log('⚙️  Processing split logic via Pinch API (Simulated)...');
  await sleep(1500);
  console.log('⚙️  Validating Application Fees (Organizer Commission)...');
  await sleep(1500);

  // Print results
  let totalOrganizerCommission = 0;

  console.log('\n💸 SETTLEMENT INSTRUCTIONS DISPATCHED TO BANK:\n');

  for (const [_, totals] of vendorTotals.entries()) {
    totalOrganizerCommission += totals.commissionTotal;

    console.log(`   🏦 VENDOR PAYOUT: ${totals.vendorName}`);
    console.log(`      Gross Sales:  $${(totals.grossTotal / 100).toFixed(2)} (${totals.txCount} transactions)`);
    console.log(`      Commission:  -$${(totals.commissionTotal / 100).toFixed(2)} (${(totals.eventCommissionRate * 100).toFixed(0)}% cut)`);
    console.log(`      -------------------------`);
    console.log(`      NET TO BANK:  $${(totals.netTotal / 100).toFixed(2)}\n`);
    
    await sleep(800);
  }

  console.log(`   👑 ORGANIZER PAYOUT`);
  console.log(`      Total Commission Collected: $${(totalOrganizerCommission / 100).toFixed(2)}`);
  console.log(`      -------------------------`);
  console.log(`      NET TO BANK:                $${(totalOrganizerCommission / 100).toFixed(2)}\n`);

  await sleep(1000);

  // Save the updated database
  await prisma.transaction.updateMany({
    where: { id: { in: pendingTxs.map(t => t.id) } },
    data: { status: 'settled' }
  });

  console.log('💾 Database successfully updated. Transactions marked as "settled".');
  console.log('✅ OVERNIGHT SETTLEMENT COMPLETE.');
  console.log('\n======================================================\n');
}

runSettlement().catch(console.error);
