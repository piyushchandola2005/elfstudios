import React from "react";
import { prisma } from "@/lib/prisma";
import { format, addDays, startOfToday } from "date-fns";

export default async function AdminCalendarPage() {
  const today = startOfToday();
  const next7Days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  // Fetch bookings for the next 7 days
  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: today,
        lt: addDays(today, 8) // Up to 7 days out
      },
      status: "CONFIRMED"
    },
    include: {
      user: true
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Calendar View
        </h1>
        <p className="text-gray-500 font-sans mt-2">
          Confirmed bookings for the next 7 days.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {next7Days.map((day) => {
          const dayBookings = bookings.filter(b => 
            new Date(b.date).toDateString() === day.toDateString()
          );

          return (
            <div key={day.toISOString()} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="bg-black text-white p-3 text-center border-b border-black/10">
                <div className="font-mono text-[10px] uppercase tracking-widest text-elf-orange">
                  {format(day, "EEEE")}
                </div>
                <div className="font-display font-black text-xl">
                  {format(day, "d MMM")}
                </div>
              </div>
              
              <div className="p-2 flex-1 overflow-y-auto space-y-2 bg-gray-50">
                {dayBookings.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-8 font-sans">
                    No bookings
                  </div>
                ) : (
                  dayBookings.map(booking => {
                    const formattedSlots = booking.slots.map(s => {
                      const i = parseInt(s);
                      const ampm1 = i >= 12 ? "PM" : "AM";
                      const hour1 = i > 12 ? i - 12 : i;
                      return `${hour1} ${ampm1}`;
                    }).join(", ");

                    return (
                      <div key={booking.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-elf-orange transition-colors">
                        <div className="text-[10px] font-mono font-bold text-black" title={formattedSlots}>
                          {formattedSlots}
                        </div>
                        <div className="text-sm font-sans font-bold text-elf-orange mt-1 truncate">
                          {booking.user.bandName || booking.user.name || "Unknown Band"}
                        </div>
                        <div className="text-[10px] font-sans text-gray-500 mt-1">
                          {booking.user.phone}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
