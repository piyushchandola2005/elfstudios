import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { txnid?: string };
}) {
  let ticketNumber = null;
  
  if (searchParams.txnid) {
    const booking = await prisma.booking.findUnique({
      where: { payuTxnId: searchParams.txnid },
      select: { ticketNumber: true }
    });
    ticketNumber = booking?.ticketNumber;
  }

  return (
    <main className="min-h-screen p-8 md:p-16 lg:p-24 flex flex-col items-center justify-center font-sans text-center">
      <div className="w-full max-w-2xl border-t-4 border-green-500 bg-elf-gray/50 p-8 space-y-6">
        <h1 className="font-display text-4xl text-green-500 uppercase tracking-widest">
          Booking Confirmed!
        </h1>
        <p className="font-sans text-gray-300">
          Your jam session has been successfully booked. We've received your payment and your slot is locked in.
        </p>
        
        {ticketNumber && (
          <div className="pt-6 border-t border-gray-800">
            <p className="font-mono text-sm text-gray-400 uppercase tracking-widest mb-2">Ticket Number</p>
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 inline-block">
              <p className="font-display text-4xl text-elf-orange font-black tracking-widest">{ticketNumber}</p>
            </div>
          </div>
        )}

        {searchParams.txnid && (
          <div className="pt-4 mt-2">
            <p className="font-mono text-xs text-gray-500 uppercase">Transaction ID: {searchParams.txnid}</p>
          </div>
        )}

        <div className="pt-8">
          <Link href="/" className="inline-block bg-elf-orange text-black font-display uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors border-2 border-elf-orange hover:border-white font-bold">
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
