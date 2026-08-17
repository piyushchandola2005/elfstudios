import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHash, verifyPaymentWithPayU } from "@/lib/payu";
import { sendBookingConfirmation } from "@/lib/mail";

export async function POST(req: Request) {
  const envSiteUrl = process.env.SITE_URL ? (process.env.SITE_URL.startsWith('http') ? process.env.SITE_URL : `https://${process.env.SITE_URL}`) : null;
  const siteUrl = (envSiteUrl || new URL(req.url).origin).replace(/\/$/, "");
  try {
    const formData = await req.formData();
    const response = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { txnid, status, hash } = response;
    if (!txnid || !status || !hash || !verifyHash(response, hash)) {
      return NextResponse.redirect(`${siteUrl}/booking/error?reason=invalid-response`, 303);
    }

    const booking = await prisma.booking.findUnique({ where: { payuTxnId: txnid }, include: { user: true } });
    if (!booking || response.udf1 !== booking.id || Number(response.amount) !== Number(booking.totalAmount)) {
      return NextResponse.redirect(`${siteUrl}/booking/error?reason=payment-mismatch`, 303);
    }

    if (status === "success") {
      const verified = await verifyPaymentWithPayU(txnid, Number(booking.totalAmount).toFixed(2));
      if (!verified) {
        return NextResponse.redirect(`${siteUrl}/booking/error?reason=verification-pending`, 303);
      }
      const updated = await prisma.booking.updateMany({
        where: { id: booking.id, status: { not: "CONFIRMED" } },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paidAt: new Date(),
          expiresAt: null,
          payuPaymentId: response.mihpayid || null,
        },
      });
      if (updated.count && booking.user.email) {
        const confirmed = await prisma.booking.findUnique({ where: { id: booking.id }, include: { user: true } });
        if (confirmed) await sendBookingConfirmation(confirmed, booking.user.email);
      }
      return NextResponse.redirect(`${siteUrl}/booking/success?txnid=${encodeURIComponent(txnid)}`, 303);
    }

    if (status === "pending") {
      return NextResponse.redirect(`${siteUrl}/booking/error?reason=payment-pending`, 303);
    }

    await prisma.booking.updateMany({
      where: { id: booking.id, status: "PENDING" },
      data: { status: "CANCELLED", paymentStatus: "FAILED", cancelledAt: new Date(), cancelledBy: "PAYU" },
    });
    return NextResponse.redirect(`${siteUrl}/booking/error?reason=payment-failed`, 303);
  } catch (error) {
    console.error("PayU callback error:", error);
    return NextResponse.redirect(`${siteUrl}/booking/error?reason=callback-error`, 303);
  }
}

