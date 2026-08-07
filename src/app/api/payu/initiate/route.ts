import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHash, PAYU_MERCHANT_KEY, PAYU_URL } from "@/lib/payu";
import { randomBytes } from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { attendees, bandName, phone, date, slots, equipmentRequests, ticketNumber, totalAmount } = body;

    if (!totalAmount || !attendees || !date || !slots || slots.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique transaction ID
    const txnid = "ELF" + Date.now() + randomBytes(4).toString("hex").substring(0, 5);

    // Update user profile with bandname and phone if missing
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email || "",
        bandName: bandName || undefined,
        phone: phone || undefined,
      },
      update: {
        bandName: bandName || undefined,
        phone: phone || undefined,
      },
    });

    // Create a pending booking in the database
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        attendees,
        date: new Date(date),
        slots,
        equipmentRequests,
        ticketNumber,
        totalAmount,
        status: "PENDING",
        payuTxnId: txnid,
      },
    });

    // ==========================================
    // DEV STUB: Skip PayU completely and confirm booking
    // Set to false when moving to production
    // ==========================================
    const isDevStub = true; 
    
    if (isDevStub) {
      // Mark as confirmed immediately
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" }
      });
      
      // Return empty params to trigger frontend redirect bypass
      return NextResponse.json({
        url: `/booking/success?txnid=${txnid}`,
        params: {}
      });
    }

    // Prepare PayU Form Data
    const payuData = {
      key: PAYU_MERCHANT_KEY,
      txnid,
      amount: totalAmount.toString(),
      productinfo: "Jam Session Booking",
      firstname: user.email?.split("@")[0] || "Musician",
      email: user.email || "",
      phone: phone || "",
      surl: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https' : 'http'}://${req.headers.get("host")}/api/payu/callback`,
      furl: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https' : 'http'}://${req.headers.get("host")}/api/payu/callback`,
    };

    const hash = generateHash(payuData);

    return NextResponse.json({
      url: PAYU_URL,
      params: {
        ...payuData,
        hash,
      },
    });
  } catch (error) {
    console.error("PayU Initiate Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
