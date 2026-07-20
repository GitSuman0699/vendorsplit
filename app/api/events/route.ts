import { NextRequest, NextResponse } from 'next/server';
import { createEvent, listEvents } from '@/lib/db';
import type { ApiResponse, Event } from '@/lib/types';

export async function GET() {
  try {
    const events = await listEvents();
    return NextResponse.json({ success: true, data: events } satisfies ApiResponse<Event[]>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    if (body.commissionRate < 0 || body.commissionRate > 0.5) {
      return NextResponse.json(
        { success: false, error: 'Commission rate must be between 0% and 50%' } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    const event = await createEvent({
      name: body.name,
      description: body.description,
      date: body.date,
      location: body.location,
      commissionRate: body.commissionRate,
    } as any);

    return NextResponse.json({ success: true, data: event } satisfies ApiResponse<Event>);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) } satisfies ApiResponse<never>,
      { status: 500 }
    );
  }
}
