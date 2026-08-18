import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHash, verifyPaymentWithPayU } from "@/lib/payu";
import { sendBookingConfirmation } from "@/lib/mail";
import { syncBookingToGoogleCalendar } from "@/lib/google-calendar";

export async function POST(req: Request) {
  const envSiteUrl = process.env.SITE_URL ? (process.env.SITE_URL.startsWith('http') ? process.env.SITE_URL : `https://${process.env.SITE_URL}`) : null;
  const siteUrl = (envSiteUrl || new URL(req.url).origin).replace(/\/$/, "");
  try {
    const formData = await req.formData();
    const response = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { txnid, status, hash } = response;
    const htmlRedirect = (url: string) => new NextResponse(
      `<html><body><script>window.location.href="${url}";</script><noscript><meta http-equiv="refresh" content="0;url=${url}"></noscript></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );

    if (!txnid || !status || !hash || !verifyHash(response, hash)) {
      return htmlRedirect(`${siteUrl}/booking/error?reason=invalid-response`);
    }

    const booking = await prisma.booking.findUnique({ where: { payuTxnId: txnid }, include: { user: true } });
    if (!booking || response.udf1 !== booking.id || Number(response.amount) !== Number(booking.totalAmount)) {
      return htmlRedirect(`${siteUrl}/booking/error?reason=payment-mismatch`);
    }

    if (status === "success") {
      const verified = await verifyPaymentWithPayU(txnid, Number(booking.totalAmount).toFixed(2));
      if (!verified) {
        return htmlRedirect(`${siteUrl}/booking/error?reason=verification-pending`);
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
      if (updated.count) {
        const confirmed = await prisma.booking.findUnique({ where: { id: booking.id }, include: { user: true } });
        if (confirmed) {
          const effects: Promise<unknown>[] = [syncBookingToGoogleCalendar(confirmed)];
          if (booking.user.email) effects.push(sendBookingConfirmation(confirmed, booking.user.email));
          const results = await Promise.allSettled(effects);
          results.filter((result) => result.status === "rejected").forEach((result) => console.error("Booking confirmation side effect failed:", result.reason));
        }
      }
      return htmlRedirect(`${siteUrl}/booking/success?txnid=${encodeURIComponent(txnid)}`);
    }

    if (status === "pending") {
      return htmlRedirect(`${siteUrl}/booking/error?reason=payment-pending`);
    }

    await prisma.booking.updateMany({
      where: { id: booking.id, status: "PENDING" },
      data: { status: "CANCELLED", paymentStatus: "FAILED", cancelledAt: new Date(), cancelledBy: "PAYU" },
    });
    return htmlRedirect(`${siteUrl}/booking/error?reason=payment-failed`);
  } catch (error) {
    console.error("PayU callback error:", error);
    return new NextResponse(
      `<html><body><script>window.location.href="${siteUrl}/booking/error?reason=callback-error";</script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
