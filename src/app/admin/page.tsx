import React from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch some stats
  const totalUsers = await prisma.user.count();
  
  const upcomingBookingsCount = await prisma.booking.count({
    where: {
      date: { gte: today },
      status: "CONFIRMED"
    }
  });

  const revenueResult = await prisma.booking.aggregate({
    where: { status: "CONFIRMED" },
    _sum: { totalAmount: true }
  });
  const totalRevenue = revenueResult._sum.totalAmount || 0;

  // Fetch 5 most recent upcoming bookings
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      date: { gte: today },
      status: "CONFIRMED"
    },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" }
    ],
    take: 5,
    include: {
      user: true
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Dashboard
        </h1>
        <p className="text-gray-500 font-sans mt-2">
          Overview of Elf Jampad operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Total Bands</div>
          <div className="text-4xl font-display">{totalUsers}</div>
        </Card>
        
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Upcoming Sessions</div>
          <div className="text-4xl font-display text-elf-orange">{upcomingBookingsCount}</div>
        </Card>
        
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Total Revenue</div>
          <div className="text-4xl font-display">₹{totalRevenue.toLocaleString()}</div>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-display font-bold uppercase mb-6">Up Next in the Pad</h2>
        {upcomingBookings.length === 0 ? (
          <div className="text-gray-500 font-sans p-8 border border-dashed border-gray-300 rounded-2xl text-center">
            No upcoming confirmed bookings.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-gray-50 text-gray-500 font-mono text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-normal">Date & Time</th>
                  <th className="px-6 py-4 font-normal">Band / User</th>
                  <th className="px-6 py-4 font-normal">Attendees</th>
                  <th className="px-6 py-4 font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-black">{format(new Date(booking.date), "EEE, MMM do")}</div>
                      <div className="text-gray-500">
                        {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
