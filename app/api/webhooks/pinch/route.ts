import { NextRequest, NextResponse } from 'next/server';
import { getVendorByPinchMerchantId, createTransaction, getEvent } from '@/lib/db';
import crypto from 'crypto';

/**
 * Pinch Webhook Handler
 * 
 * Pinch sends webhook events for payment lifecycle changes.
 * Key events we care about:
 * - realtime-payment: Credit card payment processed immediately
 * - bank-results: Direct debit success/failure results
 * - transfer: Settlement/transfer to merchant bank account
 * - scheduled-process: Scheduled payment processed
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('Pinch-Signature') || request.headers.get('pinch-signature');
    const secret = process.env.PINCH_WEBHOOK_SECRET;

    if (secret && secret !== 'whsec_REPLACE_ME') {
      if (!signature) {
        console.error('[VendorSplit Webhook] Missing signature header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
        
      if (signature !== expectedSignature) {
        console.error('[VendorSplit Webhook] Invalid signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    console.log('[VendorSplit Webhook] Received:', JSON.stringify(body, null, 2));

    const eventType = body.type || body.eventType;
    const data = body.data || body;

    switch (eventType) {
      case 'realtime-payment':
      case 'payment-success': {
        // A payment was successfully processed
        const merchantId = body.merchantId || data.merchantId;
        const vendor = merchantId ? await getVendorByPinchMerchantId(merchantId) : null;

        if (vendor) {
          const event = await getEvent(vendor.eventId);
          const amount = data.amount || 0;
          const commissionRate = event?.commissionRate || 0.1;
          const commission = Math.round(amount * commissionRate);

          await createTransaction({
            vendorId: vendor.id,
            eventId: vendor.eventId,
            pinchPaymentId: data.paymentId || data.id || `pmt_webhook_${Date.now()}`,
            amount,
            commission,
            netAmount: amount - commission,
            status: 'success',
            customerName: data.payerName || data.payer?.firstName,
            customerEmail: data.payerEmail || data.payer?.emailAddress,
            paymentMethod: data.sourceType === 'bank-account' ? 'bank-account' : 'credit-card',
          } as any);

          console.log(`[VendorSplit Webhook] Payment recorded: ${amount} cents for vendor ${vendor.name}`);
        }
        break;
      }

      case 'bank-results': {
        // Direct debit result — could be success or dishonour
        console.log('[VendorSplit Webhook] Bank results received:', data);
        break;
      }

      case 'transfer': {
        // Settlement transfer to merchant's bank account
        console.log('[VendorSplit Webhook] Transfer event:', data);
        break;
      }

      case 'payment-failed':
      case 'dishonour': {
        // Payment failed or was dishonoured
        console.log('[VendorSplit Webhook] Payment failed:', data);
        break;
      }

      default:
        console.log(`[VendorSplit Webhook] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[VendorSplit Webhook] Error processing webhook:', error);
    // Still return 200 — we don't want Pinch to retry
    return NextResponse.json({ received: true, error: String(error) });
  }
}
