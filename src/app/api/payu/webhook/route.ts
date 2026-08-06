import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHash } from "@/lib/payu";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payuResponse = Object.fromEntries(formData.entries()) as Record<string, string>;

    const { txnid, status, hash } = payuResponse;

    if (!txnid || !status || !hash) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const isValid = verifyHash(payuResponse, hash);

    if (!isValid) {
      console.error("PayU Webhook Hash Verification Failed for txnid:", txnid);
      return NextResponse.json({ error: "Invalid hash" }, { status: 403 });
    }

    if (status === "success") {
      await prisma.booking.update({
        where: { payuTxnId: txnid },
        data: { status: "CONFIRMED" },
      });
    } else {
      await prisma.booking.update({
        where: { payuTxnId: txnid },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("PayU Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
