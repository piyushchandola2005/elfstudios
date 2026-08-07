import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  let isUnique = false;
  let ticketNumber = "";

  // Loop until we generate a number that does not exist in the database
  while (!isUnique) {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const digits = String(Math.floor(Math.random() * 100000)).padStart(5, "0"); // 00000-99999
    
    ticketNumber = `${letter}-${digits}`;

    const existing = await prisma.booking.findUnique({
      where: { ticketNumber }
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return NextResponse.json({ ticketNumber });
}

