import { NextResponse } from "next/server";

// Ticket numbers are assigned atomically when a booking is created. This legacy
// endpoint remains as a stable response for older cached clients.
export async function GET() {
  return NextResponse.json({ ticketNumber: "Assigned after payment" });
}
