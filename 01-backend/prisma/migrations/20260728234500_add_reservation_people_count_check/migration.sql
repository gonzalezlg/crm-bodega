ALTER TABLE "reservations"
ADD CONSTRAINT "reservation_people_count_check"
CHECK ("people_count" >= 1);
