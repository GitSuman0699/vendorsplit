import { getPayment } from '@/lib/pinch';
import { getVendor, createTransaction, getTransactionByPinchPaymentId, getEvent } from '@/lib/db';
import Link from 'next/link';
import { formatCents } from '@/lib/pinch';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ paymentId?: string; vendorId?: string }>;
};

export default async function PaymentCompletePage({ searchParams }: PageProps) {
  const { paymentId, vendorId } = await searchParams;

  if (!paymentId || !vendorId) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1>Missing Payment Details</h1>
        <p>Could not verify payment.</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const vendor = await getVendor(vendorId);
  if (!vendor) return notFound();
  const event = await getEvent(vendor.eventId);
  if (!event) return notFound();

  // 1. Fetch payment details from Pinch
  let payment;
  try {
    payment = await getPayment(paymentId, vendor.pinchMerchantId);
  } catch (err) {
    console.error('Failed to get payment from Pinch:', err);
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1>Payment Verification Failed</h1>
        <p>We could not retrieve the payment from Pinch.</p>
      </div>
    );
  }

  if (payment.status !== 'success' && payment.status !== 'approved') {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h1>Payment Pending / Failed</h1>
        <p>The payment status is: <strong>{payment.status}</strong></p>
        <Link href={`/vendor/${vendor.id}`} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Return to Point of Sale
        </Link>
      </div>
    );
  }

  // 2. Check if we already recorded this transaction
  const existingTx = await getTransactionByPinchPaymentId(paymentId);
  if (!existingTx) {
    // 3. Record it! This simulates what our Webhook should normally do.
    const applicationFee = payment.applicationFee || Math.round(payment.amount * event.commissionRate);
    
    await createTransaction({
      vendorId: vendor.id,
      eventId: vendor.eventId,
      pinchPaymentId: paymentId,
      amount: payment.amount,
      commission: applicationFee,
      netAmount: payment.amount - applicationFee,
      status: payment.status,
      customerName: 'Customer', // Pinch API doesn't return payer name directly on payment object
      paymentMethod: 'credit-card',
    } as any); // using as any because currency might have been dropped in Prisma schema
    console.log(`[VendorSplit] Recorded new payment ${paymentId} for ${vendor.name}`);
  } else {
    console.log(`[VendorSplit] Payment ${paymentId} already recorded.`);
  }

  return (
    <div className="page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
      <h1 style={{ marginBottom: '10px' }}>Payment Successful!</h1>
      <p style={{ color: 'var(--color-slate-light)', marginBottom: '30px', fontSize: '1.2rem' }}>
        Paid <strong>{formatCents(payment.amount)}</strong> to {vendor.name}
      </p>
      
      <div className="card" style={{ maxWidth: '400px', width: '100%', marginBottom: '30px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: 'var(--color-slate-light)' }}>Transaction ID</span>
          <span className="mono" style={{ fontSize: '0.8rem' }}>{paymentId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: 'var(--color-slate-light)' }}>Date</span>
          <span>{new Date(payment.transactionDate || Date.now()).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-slate-light)' }}>Event</span>
          <span>{event.name}</span>
        </div>
      </div>

      <Link href={`/vendor/${vendor.id}`} className="btn btn-primary">
        Return to Point of Sale
      </Link>
    </div>
  );
}
