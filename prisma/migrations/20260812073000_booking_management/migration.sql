-- Extend bookings with an explicit payment and change-management lifecycle.
ALTER TABLE "Booking" ADD COLUMN "cancellationReason" TEXT,
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelledBy" TEXT,
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
ADD COLUMN "payuPaymentId" TEXT;

-- Existing confirmed records predate the explicit paymentStatus column.
UPDATE "Booking" SET "paymentStatus" = 'PAID' WHERE "status" = 'CONFIRMED';
UPDATE "Booking" SET "paymentStatus" = 'FAILED' WHERE "status" = 'CANCELLED';
UPDATE "Booking" SET "paymentStatus" = 'PENDING' WHERE "status" = 'PENDING';

CREATE TABLE "BookingChangeRequest" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "requestedDate" TIMESTAMP(3),
  "requestedSlots" TEXT[],
  "adminNote" TEXT,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BookingChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BookingChangeRequest_bookingId_status_idx" ON "BookingChangeRequest"("bookingId", "status");
CREATE INDEX "BookingChangeRequest_status_createdAt_idx" ON "BookingChangeRequest"("status", "createdAt");
CREATE INDEX "Booking_date_status_idx" ON "Booking"("date", "status");
CREATE INDEX "Booking_userId_date_idx" ON "Booking"("userId", "date");
CREATE INDEX "Booking_expiresAt_idx" ON "Booking"("expiresAt");
ALTER TABLE "BookingChangeRequest" ADD CONSTRAINT "BookingChangeRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
