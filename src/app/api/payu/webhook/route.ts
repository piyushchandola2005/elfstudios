import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHash } from "@/lib/payu";
import { sendBookingConfirmation } from "@/lib/mail";
import { syncBookingToGoogleCalendar } from "@/lib/google-calendar";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const response = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { txnid, status, hash } = response;
    if (!txnid || !status || !hash) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    if (!verifyHash(response, hash)) return NextResponse.json({ error: "Invalid hash" }, { status: 403 });

    const booking = await prisma.booking.findUnique({ where: { payuTxnId: txnid }, include: { user: true } });
    if (!booking || response.udf1 !== booking.id || Number(response.amount) !== Number(booking.totalAmount)) {
      return NextResponse.json({ error: "Transaction mismatch" }, { status: 409 });
    }

    if (status === "success") {
      const updated = await prisma.booking.updateMany({
        where: { id: booking.id, status: { not: "CONFIRMED" } },
        data: { status: "CONFIRMED", paymentStatus: "PAID", paidAt: new Date(), expiresAt: null, payuPaymentId: response.mihpayid || null },
      });
      if (updated.count) {
        const confirmed = await prisma.booking.findUnique({ where: { id: booking.id }, include: { user: true } });
        if (confirmed) {
          const effects: Promise<unknown>[] = [syncBookingToGoogleCalendar(confirmed)];
          if (booking.user.email) effects.push(sendBookingConfirmation(confirmed, booking.user.email));
          const results = await Promise.allSettled(effects);
          results.filter((result) => result.status === "rejected").forEach((result) => console.error("Booking confirmation side effect failed:", result.reason));
        }
      }
    } else if (status !== "pending") {
      await prisma.booking.updateMany({
        where: { id: booking.id, status: "PENDING" },
        data: { status: "CANCELLED", paymentStatus: "FAILED", cancelledAt: new Date(), cancelledBy: "PAYU" },
      });
    }
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("PayU webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
