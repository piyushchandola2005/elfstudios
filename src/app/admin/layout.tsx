import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Admin Protection
  if (!user || !user.email) {
    redirect("/login");
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  if (!adminEmails.includes(user.email)) {
    redirect("/book"); // Not an admin
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white p-6 flex flex-col min-h-[100px] md:min-h-screen sticky top-0">
        <div className="mb-8">
          <Image 
            src="/assets/ELF JAMPAD white.png" 
            alt="Elf Jampad Logo" 
            width={120} 
            height={40} 
            className="mb-4"
          />
          <div className="text-[10px] font-mono tracking-widest uppercase text-elf-orange">
            Admin Portal
          </div>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <Link 
            href="/admin" 
            className="px-4 py-3 text-sm font-sans rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/bookings" 
            className="px-4 py-3 text-sm font-sans rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Bookings
          </Link>
          <Link
            href="/my-bookings"
            className="px-4 py-3 text-sm font-sans rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Customer View
          </Link>
          <Link 
            href="/admin/calendar" 
            className="px-4 py-3 text-sm font-sans rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Calendar
          </Link>
          <Link 
            href="/admin/users" 
            className="px-4 py-3 text-sm font-sans rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Users
          </Link>
        </nav>

        <div className="mt-auto hidden md:block pt-8 border-t border-white/10">
          <div className="text-[10px] font-mono text-gray-400 mb-2 truncate">
            {user.email}
          </div>
          <Link 
            href="/book"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            &larr; Back to Booking
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
