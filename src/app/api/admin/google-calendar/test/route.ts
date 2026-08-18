import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { createGoogleCalendarTestEvent } from "@/lib/google-calendar";

export async function POST() {
  const auth = await requireApiAdmin();
  if (!auth.user) return auth.response;

  try {
    const event = await createGoogleCalendarTestEvent();
    return NextResponse.json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the Calendar test event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
