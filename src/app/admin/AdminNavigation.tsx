"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/calendar", label: "Schedule", icon: CalendarDays },
  { href: "/admin/users", label: "Customers", icon: Users },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${
              active
                ? "bg-white text-black shadow-sm"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
