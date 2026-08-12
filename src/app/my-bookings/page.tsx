import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { BOOKING_POLICY } from "@/lib/booking-policy";
import { MyBookingsClient } from "./MyBookingsClient";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { changeRequests: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <MyBookingsClient
      email={user.email || ""}
      policy={{
        cutoffHours: BOOKING_POLICY.changeCutoffHours,
        extensionDays: BOOKING_POLICY.rescheduleExtensionDays,
      }}
      initialBookings={bookings.map((booking) => ({
        ...booking,
        date: booking.date.toISOString(),
        originalDate: booking.originalDate.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        paidAt: booking.paidAt?.toISOString() || null,
        expiresAt: booking.expiresAt?.toISOString() || null,
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        changeRequests: booking.changeRequests.map((request) => ({
          ...request,
          requestedDate: request.requestedDate?.toISOString() || null,
          resolvedAt: request.resolvedAt?.toISOString() || null,
          createdAt: request.createdAt.toISOString(),
          updatedAt: request.updatedAt.toISOString(),
        })),
      }))}
    />
  );
}
