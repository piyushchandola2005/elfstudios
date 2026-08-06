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
    const { attendees, bandName, phone, date, startTime, endTime, totalAmount } = body;

    if (!totalAmount || !attendees) {
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
        date: new Date(date || new Date()), // Replace with actual date logic
        startTime: new Date(startTime || new Date()), // Replace with actual logic
        endTime: new Date(endTime || new Date()), // Replace with actual logic
        totalAmount,
        status: "PENDING",
        payuTxnId: txnid,
      },
    });

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
