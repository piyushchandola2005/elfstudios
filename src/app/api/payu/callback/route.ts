import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHash } from "@/lib/payu";
import { sendBookingConfirmation } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payuResponse = Object.fromEntries(formData.entries()) as Record<string, string>;

    const { txnid, status, hash } = payuResponse;

    if (!txnid || !status || !hash) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/booking/error`);
    }

    // Verify Hash to prevent tampering
    const isValid = verifyHash(payuResponse, hash);

    if (!isValid) {
      console.error("PayU Hash Verification Failed for txnid:", txnid);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/booking/error`);
    }

    // Hash is valid, update database
    if (status === "success") {
      const confirmedBooking = await prisma.booking.update({
        where: { payuTxnId: txnid },
        data: { status: "CONFIRMED" },
        include: { user: true } // Include user to get email address
      });
      
      // Send confirmation emails in the background
      if (confirmedBooking.user?.email) {
        sendBookingConfirmation(confirmedBooking, confirmedBooking.user.email).catch(console.error);
      }
      
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/booking/success?txnid=${txnid}`);
    } else {
      await prisma.booking.update({
        where: { payuTxnId: txnid },
        data: { status: "CANCELLED" },
      });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/booking/error`);
    }
  } catch (error) {
    console.error("PayU Callback Error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/booking/error`);
  }
}
