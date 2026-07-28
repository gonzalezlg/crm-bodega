-- CreateEnum
CREATE TYPE "AvailabilityExceptionType" AS ENUM ('CLOSED', 'CAPACITY_OVERRIDE', 'EXTRA_SLOT');

-- CreateTable
CREATE TABLE "availability_exceptions" (
    "id" UUID NOT NULL,
    "experience_id" UUID NOT NULL,
    "time_slot_id" UUID,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "type" "AvailabilityExceptionType" NOT NULL,
    "capacity" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availability_exceptions_experience_id_idx" ON "availability_exceptions"("experience_id");

-- CreateIndex
CREATE INDEX "availability_exceptions_date_idx" ON "availability_exceptions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_exceptions_experience_id_date_start_time_key" ON "availability_exceptions"("experience_id", "date", "start_time");

-- AddForeignKey
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
