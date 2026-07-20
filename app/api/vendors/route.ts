import { NextRequest, NextResponse } from 'next/server';
import { createVendor, getEvent } from '@/lib/db';
import { createManagedMerchant } from '@/lib/pinch';
import type { ApiResponse, Vendor } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['eventId', 'name', 'email', 'bankBsb', 'bankAccountNumber', 'bankAccountName', 'contactFirstName', 'contactLastName'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` } satisfies ApiResponse<never>,
          { status: 400 }
        );
      }
    }

    // Verify event exists
    const event = await getEvent(body.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' } satisfies ApiResponse<never>,
        { status: 404 }
      );
    }

    // Step 1: Create Managed Merchant in Pinch
    console.log(`[VendorSplit] Creating managed merchant for: ${body.name}`);
    const merchant = await createManagedMerchant({
      companyName: body.name,
      companyEmail: body.email,
      bankBsb: body.bankBsb,
      bankAccountNumber: body.bankAccountNumber,
      bankAccountName: body.bankAccountName,
      contactFirstName: body.contactFirstName,
      contactLastName: body.contactLastName,
      contactEmail: body.email,
    });

    // Use the actual merchant.id for Current-Merchant header
    const merchantId = merchant.id;
    console.log(`[VendorSplit] Managed merchant created: ${merchantId}`);

    // Payment links are created on-demand via /api/pay when charging a customer

    // Step 2: Save vendor to our database
    const vendor = await createVendor({
      eventId: body.eventId,
      name: body.name,
      email: body.email,
      pinchMerchantId: merchantId,
    } as any);

    console.log(`[VendorSplit] Vendor created: ${vendor.id} → Pinch: ${merchantId}`);

    return NextResponse.json({ success: true, data: vendor } satisfies ApiResponse<Vendor>);
  } catch (error) {
    console.error('[VendorSplit] Vendor creation failed:', error);
    return NextResponse.json(
      { success: false, error: String(error) } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
