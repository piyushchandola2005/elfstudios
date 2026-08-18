-- Retain the Google Calendar event ID so reschedules and cancellations update the same event.
ALTER TABLE "Booking"
  ADD COLUMN "googleCalendarEventId" TEXT,
  ADD COLUMN "googleCalendarSyncedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Booking_googleCalendarEventId_key" ON "Booking"("googleCalendarEventId");
