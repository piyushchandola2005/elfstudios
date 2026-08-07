import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  
  if (!dateStr) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const targetDate = parseISO(dateStr);
    
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate)
        },
        status: {
          in: ["PENDING", "CONFIRMED"] // Exclude CANCELLED
        }
      },
      include: {
        user: {
          select: {
            bandName: true
          }
        }
      }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
