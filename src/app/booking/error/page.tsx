export default function ErrorPage() {
  return (
    <main className="min-h-screen p-8 md:p-16 lg:p-24 flex flex-col items-center justify-center font-sans text-center">
      <div className="w-full max-w-2xl border-t-4 border-red-500 bg-elf-gray/50 p-8 space-y-6">
        <h1 className="font-display text-4xl text-red-500 uppercase tracking-widest">
          Payment Failed
        </h1>
        <p className="font-sans text-gray-300">
          We couldn't process your payment. Your booking has not been confirmed. Please try again.
        </p>

        <div className="pt-8">
          <a href="https://www.elfstudios.in/elf-jampad" className="inline-block bg-elf-orange text-black font-display uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors border-2 border-elf-orange hover:border-white">
            Try Again
          </a>
        </div>
      </div>
    </main>
  );
}
