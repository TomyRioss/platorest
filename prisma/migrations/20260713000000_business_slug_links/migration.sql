-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'TIKTOK', 'X');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "slug" TEXT;
ALTER TABLE "Business" ADD COLUMN "logo" TEXT;

-- Backfill slug from name, deduping collisions with a numeric suffix
WITH base AS (
  SELECT id,
    trim(both '-' from regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')) AS s,
    row_number() OVER (
      PARTITION BY trim(both '-' from regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g'))
      ORDER BY "createdAt"
    ) AS rn
  FROM "Business"
)
UPDATE "Business" b
SET "slug" = CASE WHEN base.rn = 1 THEN base.s ELSE base.s || '-' || base.rn END
FROM base
WHERE b.id = base.id;

ALTER TABLE "Business" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_businessId_platform_key" ON "SocialLink"("businessId", "platform");

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
