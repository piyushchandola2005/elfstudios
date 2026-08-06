export default function SuccessPage({
  searchParams,
}: {
  searchParams: { txnid?: string };
}) {
  return (
    <main className="min-h-screen p-8 md:p-16 lg:p-24 flex flex-col items-center justify-center font-sans text-center">
      <div className="w-full max-w-2xl border-t-4 border-green-500 bg-elf-gray/50 p-8 space-y-6">
        <h1 className="font-display text-4xl text-green-500 uppercase tracking-widest">
          Booking Confirmed!
        </h1>
        <p className="font-sans text-gray-300">
          Your jam session has been successfully booked. We've received your payment and your slot is locked in.
        </p>
        
        {searchParams.txnid && (
          <div className="pt-4 border-t border-gray-800">
            <p className="font-mono text-sm text-gray-500 uppercase">Transaction ID</p>
            <p className="font-mono text-lg">{searchParams.txnid}</p>
          </div>
        )}

        <div className="pt-8">
          <a href="https://www.elfstudios.in/elf-jampad" className="inline-block bg-elf-orange text-black font-display uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors border-2 border-elf-orange hover:border-white">
            Return Home
          </a>
        </div>
      </div>
    </main>
  );
}
