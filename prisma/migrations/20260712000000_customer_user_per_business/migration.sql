-- Allow a User to have one Customer row per Business (was: one Customer total).
DROP INDEX "Customer_userId_key";

CREATE UNIQUE INDEX "Customer_businessId_userId_key" ON "Customer"("businessId", "userId");
