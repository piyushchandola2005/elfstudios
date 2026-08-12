ALTER TABLE "Booking" ADD COLUMN "originalDate" TIMESTAMP(3);
UPDATE "Booking" SET "originalDate" = "date" WHERE "originalDate" IS NULL;
ALTER TABLE "Booking" ALTER COLUMN "originalDate" SET NOT NULL;
