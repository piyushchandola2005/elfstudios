import React from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: [
      { date: "desc" }
    ],
    include: {
      user: true
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          All Bookings
        </h1>
        <p className="text-gray-500 font-sans mt-2">
          View and manage all historical and upcoming jam sessions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 font-mono text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-normal">Date & Time</th>
              <th className="px-6 py-4 font-normal">Band / User</th>
              <th className="px-6 py-4 font-normal">Attendees</th>
              <th className="px-6 py-4 font-normal">Amount</th>
              <th className="px-6 py-4 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const formattedSlots = booking.slots.map(s => {
                  const i = parseInt(s);
                  const ampm1 = i >= 12 ? "PM" : "AM";
                  const hour1 = i > 12 ? i - 12 : i;
                  return `${hour1} ${ampm1}`;
                }).join(", ");
                
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-black">{format(new Date(booking.date), "EEE, MMM do yyyy")}</div>
                      <div className="text-gray-500 max-w-[200px] truncate" title={formattedSlots}>
                        Slots: {formattedSlots}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Ticket: {booking.ticketNumber || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{booking.user.bandName || "Unknown Band"}</div>
                      <div className="text-gray-500 text-xs">{booking.user.name || booking.user.email}</div>
                      <div className="text-gray-400 text-xs">{booking.user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.attendees}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      ₹{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full ${
                        booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                        booking.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
