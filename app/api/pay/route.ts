import { NextRequest, NextResponse } from 'next/server';
import { getVendor, getEvent } from '@/lib/db';
import { createPaymentLink, createOrUpdatePayer } from '@/lib/pinch';
import type { ApiResponse } from '@/lib/types';
import QRCode from 'qrcode';

/**
 * POST /api/pay
 * Creates a payment link for a specific amount and returns the URL + QR code data URL.
 * 
 * Body: { vendorId, eventId, amount (in dollars, e.g. 12.50) }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, eventId, amount } = body;

    if (!vendorId || !eventId || !amount) {
      return NextResponse.json(
        { success: false, error: 'vendorId, eventId, and amount are required' } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents < 101) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least $1.01' } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    const vendor = await getVendor(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const event = await getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    const merchantId = vendor.pinchMerchantId;

    // Create a payer (generic walk-up customer)
    const payer = await createOrUpdatePayer({
      firstName: 'Walk-up',
      lastName: 'Customer',
      emailAddress: `customer-${Date.now()}@vendorsplit.app`,
    }, merchantId);

    // Calculate application fee (organizer commission)
    const applicationFee = Math.round(amountCents * event.commissionRate);

    // Create the payment link with the real amount
    const paymentLink = await createPaymentLink(
      {
        amount: amountCents,
        description: `${vendor.name} — ${event.name}`,
        payerId: payer.id,
        applicationFee,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-complete?vendorId=${vendorId}`,
      },
      merchantId
    );

    // Generate QR code as a data URL (PNG base64)
    const qrDataUrl = await QRCode.toDataURL(paymentLink.url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentLinkUrl: paymentLink.url,
        paymentLinkId: paymentLink.id,
        qrDataUrl,
        amountCents,
        applicationFeeCents: applicationFee,
        vendorName: vendor.name,
      },
    });
  } catch (error) {
    console.error('[VendorSplit] Payment creation failed:', error);
    return NextResponse.json(
      { success: false, error: String(error) } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
